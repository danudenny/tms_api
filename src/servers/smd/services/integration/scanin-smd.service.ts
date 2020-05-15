import { Injectable, Param, PayloadTooLargeException } from '@nestjs/common';
import moment = require('moment');
import { BadRequestException } from '@nestjs/common';
import axios from 'axios';
import { RedisService } from '../../../../shared/services/redis.service';
import { RawQueryService } from '../../../../shared/services/raw-query.service';
import { SysCounter } from '../../../../shared/orm-entity/sys-counter';
import { Bag } from '../../../../shared/orm-entity/bag';
import { ReceivedBag } from '../../../../shared/orm-entity/received-bag';
import { ReceivedBagDetail } from '../../../../shared/orm-entity/received-bag-detail';
import { BagItem } from 'src/shared/orm-entity/bag-item';
import { BagItemHistory } from 'src/shared/orm-entity/bag-item-history';
import { ScanInSmdBagResponseVm, ScanInSmdBaggingResponseVm } from '../../models/scanin-smd.response.vm';
import { HttpStatus } from '@nestjs/common';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { CustomCounterCode } from '../../../../shared/services/custom-counter-code.service';

@Injectable()
export class ScaninSmdService {
  static async scanInBag(payload: any): Promise<any> {
    // const result = {};
    const result = new ScanInSmdBagResponseVm();
    let errCode = 0;
    let errMessage ;
    const timeNow = moment().toDate();
    let paramReceivedBagId = payload.received_bag_id;
    if (payload.bag_item_number.length == 15) {
      const paramBagNumber = payload.bag_item_number.substr( 0 , (payload.bag_item_number.length) - 8 );
      const paramWeightStr = await payload.bag_item_number.substr(payload.bag_item_number.length - 5);
      const paramBagSeq = await payload.bag_item_number.substr( (payload.bag_item_number.length) - 8 , 3);
      const paramSeq = await paramBagSeq * 1;
      const weight = parseFloat(paramWeightStr.substr(0, 2) + '.' + paramWeightStr.substr(2, 2));
      if (paramBagNumber == null || paramBagNumber == undefined) {
        // result = {
        //   code: '422',
        //   message: 'Bag Number Not Found',
        // };
        throw new BadRequestException('Bag Number Not Found');
      } else {
        const bag = await Bag.findOne({
          where: {
            bagNumber: paramBagNumber,
            isDeleted: false,
          },
        });

        let paramBagId;
        let exist = false;
        let paramBagItemId = null;
        if (bag) {
          paramBagId = bag.bagId;
        } else {
          paramBagId = await this.createBag(
            paramBagNumber,
            payload.user_id,
            timeNow,
          );
        }
        const rawQuery = `
          SELECT
            bi.bag_item_id,
            bih.bag_item_status_id,
            br.branch_name as branch_name_scan,
            u.username as username_scan
          FROM bag_item bi
          LEFT JOIN bag_item_history bih ON bih.bag_item_history_id = bi.bag_item_history_id AND bih.branch_id = ${payload.branch_id} AND bih.is_deleted = false
          LEFT JOIN branch br ON br.branch_id = bih.branch_id AND br.is_deleted = false
          LEFT JOIN users u ON u.user_id = bih.user_id AND u.is_deleted = false
          WHERE
            bi.bag_id = ${paramBagId} AND
            bi.bag_seq = ${paramSeq} AND
            bi.is_deleted = false
        `;
        const resultData = await RawQueryService.query(rawQuery);
        if (resultData) {
          exist = true;
          const branchNameScan = resultData[0].branch_name_scan;
          const usernameScan = resultData[0].username_scan;
          paramBagItemId = resultData[0].bag_item_id;
          console.log(resultData[0].bag_item_status_id);
          if ( resultData[0].bag_item_status_id == null || resultData[0].bag_item_status_id == 1000 || resultData[0].bag_item_status_id == 500 ) {
            // do nothing
          } else if ( resultData[0].bag_item_status_id == 2000 ) {
            errCode = errCode + 1;
            errMessage = 'Resi Gabung Paket sudah Scan IN gerai ' + branchNameScan + ' Oleh ' + usernameScan;
          } else {
            errCode = errCode + 1;
            errMessage = 'Resi Gabung Paket belum di scan OUT di gerai';
          }
        }
        if (errCode == 0) {

          let paramTotalSeq;
          let paramTotalBagWeight;
          let isNew = true;
          if ( paramReceivedBagId > 0) {
            const resultReceivedBag = await ReceivedBag.findOne({
              where: {
                receivedBagId: paramReceivedBagId,
                isDeleted: false,
              },
            });
            if (resultReceivedBag) {
              paramTotalSeq = resultReceivedBag.totalSeq;
              paramTotalBagWeight = resultReceivedBag.totalBagWeight;
              isNew = false;
            }
          }
          if (isNew == true) {
            paramTotalSeq = 1;
            paramTotalBagWeight = weight;
            // const dataReceivedBagCode = await CustomCounterCode.receivedBagCodeRandom(
            //   timeNow,
            // );
            const dataReceivedBagCode = await this.getDataReceivedBagCode(timeNow);
            paramReceivedBagId = await this.createReceivedBag(
              dataReceivedBagCode,
              payload.employee_id,
              payload.user_id,
              payload.branch_id,
              paramTotalSeq,
              paramTotalBagWeight,
              timeNow,
            );
          } else {
            paramTotalSeq = paramTotalSeq + 1;
            paramTotalBagWeight = paramTotalBagWeight + weight ;
            await ReceivedBag.update(
              { receivedBagId: paramReceivedBagId },
              {
                totalSeq: paramTotalSeq,
                totalBagWeight: paramTotalBagWeight,
                userIdUpdated: payload.user_id,
                updatedTime: timeNow,
              },
            );
          }

          const paramReceivedBagDetailId = await this.createReceivedBagDetail(
            paramReceivedBagId,
            paramBagNumber,
            paramBagSeq,
            payload.bag_item_number,
            weight,
            payload.user_id,
          );

          if (exist == false) {
            paramBagItemId = await this.createBagItem(
              paramSeq,
              weight,
              paramBagId,
              payload.user_id,
            );
          } else {
            await BagItem.update(
              { bagItemId : paramBagItemId },
              {
                bagSeq: paramSeq,
                weight,
                bagId: paramBagId,
                userIdUpdated: payload.user_id,
                updatedTime: timeNow,
              },
            );
          }
          const resultbagItemHistory = BagItemHistory.create();
          resultbagItemHistory.bagItemId = paramBagItemId.toString();
          resultbagItemHistory.userId = payload.user_id;
          resultbagItemHistory.branchId = payload.branch_id;
          resultbagItemHistory.historyDate = moment().toDate();
          resultbagItemHistory.bagItemStatusId = '2000';
          resultbagItemHistory.userIdCreated = payload.user_id;
          resultbagItemHistory.createdTime = moment().toDate();
          resultbagItemHistory.userIdUpdated = payload.user_id;
          resultbagItemHistory.updatedTime = moment().toDate();
          await BagItemHistory.insert(resultbagItemHistory);
          console.log(resultbagItemHistory);
          console.log(resultbagItemHistory.bagItemHistoryId);
          await BagItem.update(
            { bagItemId : paramBagItemId },
            {
              bagItemHistoryId: Number(resultbagItemHistory.bagItemHistoryId),
            },
          );
        }
      }
      if (errCode == 0) {
        const showNumber = paramBagNumber + paramBagSeq + ' ('  + weight.toString() + ' Kg) ';
        const message = paramBagNumber + paramBagSeq + ' ('  + weight.toString() + ' Kg) ' + 'Scan IN berhasil';
        const data = [];
        data.push({
          show_number: showNumber,
          id: paramBagNumber + paramBagSeq,
        });
        result.statusCode = HttpStatus.OK;
        result.message = message;
        result.data = data;
        return result;
      } else {
        throw new BadRequestException(errMessage);
      }
    } else {
      throw new BadRequestException('Bag length <> 15');
    }
  }

  static async scanInBagging(payload: any): Promise<any> {
    const result = new ScanInSmdBaggingResponseVm();
    if (payload.bag_item_number.length > 15) {
      const rawQueryBag = `
        SELECT
          CONCAT(bag.bag_number, LPAD(bagItem.bag_seq::text, 3, '0')) AS bagnumber
        FROM do_pod_detail_bag doPodDetailBag
        INNER JOIN do_pod doPod ON doPod.do_pod_id=doPodDetailBag.do_pod_id AND (doPod.is_deleted = 'false')
        INNER JOIN bag_item bagItem ON bagItem.bag_item_id=doPodDetailBag.bag_item_id AND (bagItem.is_deleted = 'false')
        LEFT JOIN bag bag ON bag.bag_id=bagItem.bag_id AND (bag.is_deleted = 'false')
        LEFT JOIN bag_item_history bih ON bih.bag_item_history_id = bagItem.bag_item_history_id AND bih.branch_id = ${payload.branch_id} AND bih.is_deleted = false
        WHERE
          doPod.do_pod_code = '${payload.bag_item_number}' AND
          (bih.bag_item_status_id = 1000 OR bih.bag_item_status_id = 500 OR bih.bag_item_status_id IS NULL)
        GROUP BY bagnumber
        `;
      const resultDataBag = await RawQueryService.query(rawQueryBag);

      const rawQueryBagScanned = `
        SELECT
          CONCAT(bag.bag_number, LPAD(bagItem.bag_seq::text, 3, '0')) AS bagnumber
        FROM do_pod_detail_bag doPodDetailBag
        INNER JOIN do_pod doPod ON doPod.do_pod_id=doPodDetailBag.do_pod_id AND (doPod.is_deleted = 'false')
        INNER JOIN bag_item bagItem ON bagItem.bag_item_id=doPodDetailBag.bag_item_id AND (bagItem.is_deleted = 'false')
        LEFT JOIN bag bag ON bag.bag_id=bagItem.bag_id AND (bag.is_deleted = 'false')
        LEFT JOIN bag_item_history bih ON bih.bag_item_history_id = bagItem.bag_item_history_id AND bih.branch_id = ${payload.branch_id} AND bih.is_deleted = false
        WHERE
          doPod.do_pod_code =  '${payload.bag_item_number}' AND
          (bih.bag_item_status_id <> 1000 AND bih.bag_item_status_id <> 500 AND bih.bag_item_status_id IS NOT NULL)
        GROUP BY bagnumber
        `;
      const resultDataBagScanned = await RawQueryService.query(rawQueryBagScanned);
      if (resultDataBag) {
        const data = [];
        data.push({
          data_bag: resultDataBag,
          data_bag_scanned: resultDataBagScanned,
        });
        result.statusCode = HttpStatus.OK;
        result.message = 'Surat jalan ' + payload.bag_item_number + ' berhasil di Scan';
        result.data = data;
        return result;
      } else {
        throw new BadRequestException('Resi yang Valid tidak Ditemukan di ' + payload.bag_item_number );
      }
    } else {
      throw new BadRequestException('Bag length must > 15');
    }
  }

  private static async createBag(
    paramBagNumber: string,
    userId: number,
    bagDateTime: Date,
  ) {
    const bagDateTimeMinus = bagDateTime;
    bagDateTimeMinus.setDate( bagDateTimeMinus.getDate() - 1 );
    const dataBag = Bag.create({
      bagDate: bagDateTimeMinus,
      bagDateReal: bagDateTime,
      bagNumber: paramBagNumber,
      userIdCreated: userId,
      createdTime: moment().toDate(),
      userIdUpdated: userId,
      updatedTime: moment().toDate(),
    });
    const bag = await Bag.insert(dataBag);
    return bag.identifiers.length
      ? bag.identifiers[0].bagId
      : null;
  }

  private static async createReceivedBag(
    paramReceivedBagCode: string,
    employeeId: number,
    paramUserId: number,
    paramBranchId: number,
    paramTotalSeq: number,
    paramTotalBagWeight: number,
    receivedBagDateTime: Date,
  ) {
    const dataReceivedBag = ReceivedBag.create({
      receivedBagCode: paramReceivedBagCode,
      receivedBagDate: receivedBagDateTime,
      employeeIdConsignee: employeeId,
      userId: paramUserId,
      branchId: paramBranchId,
      totalSeq: paramTotalSeq,
      totalBagWeight: paramTotalBagWeight,
      userIdCreated: paramUserId,
      createdTime: moment().toDate(),
      userIdUpdated: paramUserId,
      updatedTime: moment().toDate(),
    });
    const receivedBag = await ReceivedBag.insert(dataReceivedBag);
    return receivedBag.identifiers.length
      ? receivedBag.identifiers[0].receivedBagId
      : null;
  }

  private static async createReceivedBagDetail(
    paramReceivedBagId: number,
    paramBagNumber: string,
    paramBagSeq: string,
    paramBagItemNumber: string,
    paramWeight: number,
    paramUserId: number,
  ) {
    const dataReceivedBagDetail = ReceivedBagDetail.create({
      receivedBagId: paramReceivedBagId,
      bagNumber: paramBagNumber + paramBagSeq,
      scannedBagNumber: paramBagItemNumber,
      bagWeight: paramWeight,
      userIdCreated: paramUserId,
      createdTime: moment().toDate(),
      userIdUpdated: paramUserId,
      updatedTime: moment().toDate(),
    });
    const receivedBagDetail = await ReceivedBagDetail.insert(dataReceivedBagDetail);
    return receivedBagDetail.identifiers.length
      ? receivedBagDetail.identifiers[0].receivedBagDetailId
      : null;
  }

  private static async createBagItem(
    paramSeq: number,
    paramWeight: number,
    paramBagId: number,
    paramUserId: number,
  ) {
    const dataBagItem = BagItem.create({
      bagSeq: paramSeq,
      weight: paramWeight,
      bagId: paramBagId,
      userIdCreated: paramUserId,
      createdTime: moment().toDate(),
      userIdUpdated: paramUserId,
      updatedTime: moment().toDate(),
    });
    const bagItem = await BagItem.insert(dataBagItem);
    return bagItem.identifiers.length
      ? bagItem.identifiers[0].bagItemId
      : null;
  }

  // TODO: need to replace
  public static async getDataReceivedBagCode(receivedBagTime: any): Promise<any> {
    let receivedBagCode = '';
    let prefix = '';
    let lastNumber = 0;
    const timeNow = moment().toDate();
    prefix = `TB/${moment(receivedBagTime).format('YYMM')}/`;
    // console.log(prefix);
    const code = await SysCounter.findOne({
      where: {
        key: prefix,
        isDeleted: false,
      },
    });
    if (code == undefined) {
      lastNumber = 1;
      const paramsSysCounter = {
        key: prefix,
        counter: lastNumber,
        created_time: timeNow,
        updated_time: timeNow,
      };
      const dataParamsSysCounter = await this.getDataSysCounter(
        paramsSysCounter,
      );
      const sys_counter = await SysCounter.insert(dataParamsSysCounter);
    } else {
      lastNumber = Math.floor(code.counter) + 1;
      await SysCounter.update(code.sysCounterId, {
        counter: lastNumber,
        updatedTime: timeNow,
      });
    }

    receivedBagCode = prefix + lastNumber.toString().padStart(5, '0');
    return receivedBagCode;
  }
  public static async getDataSysCounter(params: {}): Promise<any> {
    const syscount = await SysCounter.create({
      key: params['key'],
      counter: params['counter'],
      createdTime: params['created_time'],
      updatedTime: params['updated_time'],
    });

    return syscount;
  }
}
