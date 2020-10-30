import { Injectable, Param, PayloadTooLargeException } from '@nestjs/common';
import moment = require('moment');
import { BadRequestException } from '@nestjs/common';
import { RedisService } from '../../../../shared/services/redis.service';
import { RawQueryService } from '../../../../shared/services/raw-query.service';
import { SysCounter } from '../../../../shared/orm-entity/sys-counter';
import { Bag } from '../../../../shared/orm-entity/bag';
import { ReceivedBag } from '../../../../shared/orm-entity/received-bag';
import { ReceivedBagDetail } from '../../../../shared/orm-entity/received-bag-detail';
import { BagItem } from '../../../../shared/orm-entity/bag-item';
import { BagItemHistory } from '../../../../shared/orm-entity/bag-item-history';
import { ScanInSmdBagResponseVm, ScanInSmdBaggingResponseVm, ScanInListResponseVm, ScanInDetailListResponseVm, ScanInSmdBagMoreResponseVm, ScanInSmdBagDataResponseVm, ScaninDetailScanResponseVm } from '../../models/scanin-smd.response.vm';
import { HttpStatus } from '@nestjs/common';
import { CustomCounterCode } from '../../../../shared/services/custom-counter-code.service';
import { AuthService } from '../../../../shared/services/auth.service';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { MetaService } from '../../../../shared/services/meta.service';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { BAG_STATUS } from '../../../../shared/constants/bag-status.constant';
import { BagItemAwb } from '../../../../shared/orm-entity/bag-item-awb';
import { BagScanInBranchSmdQueueService } from '../../../queue/services/bag-scan-in-branch-smd-queue.service';
import { ScanInSmdMorePayloadVm, ScanInSmdPayloadVm, ScaninDetailScanPayloadVm } from '../../models/scanin-smd.payload.vm';
import { getManager, createQueryBuilder } from 'typeorm';

@Injectable()
export class ScaninSmdService {
  static async scanInBag(payload: any): Promise<any> {
    // const result = {};
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    const result = new ScanInSmdBagResponseVm();
    let errCode = 0;
    let errMessage ;
    const timeNow = moment().toDate();
    let paramReceivedBagId = payload.received_bag_id;
    result.statusCode = HttpStatus.BAD_REQUEST;
    let receivedBagCode = '';
    let receivedBagDate = '';

    if (payload.bag_item_number.length == 15 && payload.bag_item_number.match(/^[A-Z0-9]{7}[0-9]{8}$/)) {
      const paramBagNumber = payload.bag_item_number.substr( 0 , (payload.bag_item_number.length) - 8 );
      const paramWeightStr = await payload.bag_item_number.substr(payload.bag_item_number.length - 5);
      const paramBagSeq = await payload.bag_item_number.substr( (payload.bag_item_number.length) - 8 , 3);
      const paramSeq = await paramBagSeq * 1;
      let weight = parseFloat(paramWeightStr.substr(0, 2) + '.' + paramWeightStr.substr(2, 2));
      let paramBagItemId = null;
      if (paramBagNumber == null || paramBagNumber == undefined) {
        result.message = 'Bag Number Not Found';
        return result;
      } else {
        const bag = await Bag.findOne({
          select: ['bagId'],
          where: {
            bagNumber: paramBagNumber,
            isDeleted: false,
          },
          order: {
            createdTime: 'DESC',
          },
        });

        let paramBagId;
        let exist = false;
        if (bag) {
          paramBagId = bag.bagId;
        } else {
          paramBagId = await this.createBag(
            paramBagNumber,
            authMeta.userId,
            timeNow,
          );
        }
        const rawQuery = `
          SELECT
            bi.bag_item_id,
            bih.bag_item_status_id,
            br.branch_name as branch_name_scan,
            u.username as username_scan,
            bi.weight
          FROM bag_item bi
          LEFT JOIN bag_item_history bih ON bih.bag_item_history_id = bi.bag_item_history_id AND bih.branch_id = ${permissonPayload.branchId} AND bih.is_deleted = false
          LEFT JOIN branch br ON br.branch_id = bih.branch_id AND br.is_deleted = false
          LEFT JOIN users u ON u.user_id = bih.user_id AND u.is_deleted = false
          WHERE
            bi.bag_id = ${paramBagId} AND
            bi.bag_seq = ${paramSeq} AND
            bi.is_deleted = false
        `;
        const resultData = await RawQueryService.query(rawQuery);
        if (resultData.length > 0) {
          exist = true;
          const branchNameScan = resultData[0].branch_name_scan;
          const usernameScan = resultData[0].username_scan;
          paramBagItemId = resultData[0].bag_item_id;

          if (weight == 0) { // handle error weight = 0 from request payload
            weight = parseFloat(resultData[0].weight);
          }
          if ( resultData[0].bag_item_status_id == null || resultData[0].bag_item_status_id == 4550 || resultData[0].bag_item_status_id == 500 ) {
            // do nothing
          } else if ( resultData[0].bag_item_status_id == 3550 ) {
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
              receivedBagCode = resultReceivedBag.receivedBagCode;
              receivedBagDate = moment(resultReceivedBag.receivedBagDate).format('YYYY-MM-DD HH:mm:ss');
              paramTotalSeq = Number(resultReceivedBag.totalSeq) + 1;
              paramTotalBagWeight = Number(resultReceivedBag.totalBagWeight) + Number(weight) ;

              resultReceivedBag.totalSeq = paramTotalSeq;
              resultReceivedBag.totalBagWeight = paramTotalBagWeight;
              resultReceivedBag.userIdUpdated = authMeta.userId;
              resultReceivedBag.updatedTime = timeNow;
              await ReceivedBag.save(resultReceivedBag);

              isNew = false;
            }
          }
          if (isNew == true) {
            paramTotalSeq = 1;
            paramTotalBagWeight = weight;
            const dataReceivedBagCode = await CustomCounterCode.receivedBagCodeCounter(timeNow);
            // const dataReceivedBagCode = await this.getDataReceivedBagCode(timeNow);
            const redlock = await RedisService.redlock(`redlock:receivedBag:${dataReceivedBagCode}`, 10);
            if (redlock) {
              paramReceivedBagId = await this.createReceivedBag(
                dataReceivedBagCode,
                authMeta.employeeId,
                authMeta.userId,
                permissonPayload.branchId,
                paramTotalSeq,
                paramTotalBagWeight,
                timeNow,
              );
              receivedBagCode = dataReceivedBagCode;
              receivedBagDate = moment(timeNow).format('YYYY-MM-DD HH:mm:ss');
            } else {
              result.message = 'Data Scan In Gab.Paket Sedang di proses, Silahkan Coba Beberapa Saat';
              return result;
            }
          }

          const paramReceivedBagDetailId = await this.createReceivedBagDetail(
            paramReceivedBagId,
            paramBagNumber,
            paramBagSeq,
            payload.bag_item_number,
            weight,
            authMeta.userId,
          );

          if (exist == false) {
            paramBagItemId = await this.createBagItem(
              paramSeq,
              weight,
              paramBagId,
              authMeta.userId,
            );
          } else {
            await BagItem.update(
              { bagItemId : paramBagItemId },
              {
                bagSeq: paramSeq,
                bagId: paramBagId,
                userIdUpdated: authMeta.userId,
                updatedTime: timeNow,
              },
            );
          }
          const resultbagItemHistory = BagItemHistory.create();
          resultbagItemHistory.bagItemId = paramBagItemId.toString();
          resultbagItemHistory.userId = authMeta.userId.toString();
          resultbagItemHistory.branchId = permissonPayload.branchId.toString();
          resultbagItemHistory.historyDate = moment().toDate();
          resultbagItemHistory.bagItemStatusId = BAG_STATUS.DO_LINE_HAUL.toString();
          resultbagItemHistory.userIdCreated = authMeta.userId;
          resultbagItemHistory.createdTime = moment().toDate();
          resultbagItemHistory.userIdUpdated = authMeta.userId;
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
        // NOTE: post awb status in in last transaction when success
        // Loop data bag_item_awb for update status awb
        // TODO: need to refactor
        // send to background job
        BagScanInBranchSmdQueueService.perform(
          paramBagItemId,
          null,
          null,
          authMeta.userId,
          permissonPayload.branchId,
        );
        // const showNumber = paramBagNumber + paramBagSeq + ' ('  + weight.toString() + ' Kg) ';
        const showNumber = payload.bag_item_number + ' ('  + weight.toString() + ' Kg) ';
        // const message = paramBagNumber + paramBagSeq + ' ('  + weight.toString() + ' Kg) ' + 'Scan IN berhasil';
        const message = payload.bag_item_number + ' ('  + weight.toString() + ' Kg) ' + 'Scan IN berhasil';
        const data = [];
        data.push({
          show_number: showNumber,
          id: paramBagNumber + paramBagSeq,
          received_bag_id: paramReceivedBagId,
          received_bag_code: receivedBagCode,
          received_bag_date: receivedBagDate,
          bag_weight: Number(weight),
          bag_number: paramBagNumber,
        });
        result.statusCode = HttpStatus.OK;
        result.message = message;
        result.data = data;
        return result;
      } else {
        result.message = errMessage;
        return result;
      }
    } else if (payload.bag_item_number.length == 10 && payload.bag_item_number.match(/^[A-Z0-9]{7}[0-9]{3}$/)) {
      const paramBagNumber = (payload.bag_item_number.substr( 0 , (payload.bag_item_number.length) - 3 )).toUpperCase();
      // const paramWeightStr = await payload.bag_item_number.substr(payload.bag_item_number.length - 5);
      const paramBagSeq = await payload.bag_item_number.substr( (payload.bag_item_number.length) - 3 , 3);
      const paramSeq = await paramBagSeq * 1;
      // const weight = parseFloat(paramWeightStr.substr(0, 2) + '.' + paramWeightStr.substr(2, 2));
      let weight = 0;
      let paramBagItemId = null;

      if (paramBagNumber == null || paramBagNumber == undefined) {
        result.message = 'Bag Number Not Found';
        return result;
      } else {
        const bag = await Bag.findOne({
          select: ['bagId'],
          where: {
            bagNumber: paramBagNumber,
            isDeleted: false,
          },
          order: {
            createdTime: 'DESC',
          },
        });

        let paramBagId;
        let exist = false;
        if (bag) {
          paramBagId = bag.bagId;
        } else {
          paramBagId = await this.createBag(
            paramBagNumber,
            authMeta.userId,
            timeNow,
          );
        }
        const rawQuery = `
          SELECT
            bi.bag_item_id,
            bih.bag_item_status_id,
            br.branch_name as branch_name_scan,
            u.username as username_scan,
            bi.weight
          FROM bag_item bi
          LEFT JOIN bag_item_history bih ON bih.bag_item_history_id = bi.bag_item_history_id AND bih.branch_id = ${permissonPayload.branchId} AND bih.is_deleted = false
          LEFT JOIN branch br ON br.branch_id = bih.branch_id AND br.is_deleted = false
          LEFT JOIN users u ON u.user_id = bih.user_id AND u.is_deleted = false
          WHERE
            bi.bag_id = ${paramBagId} AND
            bi.bag_seq = ${paramSeq} AND
            bi.is_deleted = false
        `;
        const resultData = await RawQueryService.query(rawQuery);
        if (resultData.length > 0) {
          exist = true;
          const branchNameScan = resultData[0].branch_name_scan;
          const usernameScan = resultData[0].username_scan;
          paramBagItemId = resultData[0].bag_item_id;
          weight =  resultData[0].weight;
          console.log(resultData[0].bag_item_status_id);
          if ( resultData[0].bag_item_status_id == null || resultData[0].bag_item_status_id == 4550 || resultData[0].bag_item_status_id == 500 ) {
            // do nothing
          } else if ( resultData[0].bag_item_status_id == 3550 ) {
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
          const isNew = true;
          if ( paramReceivedBagId > 0) {
            const resultReceivedBag = await ReceivedBag.findOne({
              where: {
                receivedBagId: paramReceivedBagId,
                isDeleted: false,
              },
            });
            if (resultReceivedBag) {
              receivedBagCode = resultReceivedBag.receivedBagCode;
              receivedBagDate = moment(resultReceivedBag.receivedBagDate).format('YYYY-MM-DD HH:mm:ss');
              paramTotalSeq = Number(resultReceivedBag.totalSeq) + 1;
              paramTotalBagWeight = Number(resultReceivedBag.totalBagWeight) + Number(weight);

              resultReceivedBag.totalSeq = paramTotalSeq;
              resultReceivedBag.totalBagWeight = paramTotalBagWeight;
              resultReceivedBag.userIdUpdated = authMeta.userId;
              resultReceivedBag.updatedTime = timeNow;
              await ReceivedBag.save(resultReceivedBag);

            }
          }
          if (isNew == true) {
            paramTotalSeq = 1;
            paramTotalBagWeight = weight;
            const dataReceivedBagCode = await CustomCounterCode.receivedBagCodeCounter(timeNow);
            // const dataReceivedBagCode = await this.getDataReceivedBagCode(timeNow);
            const redlock = await RedisService.redlock(`redlock:receivedBag:${dataReceivedBagCode}`, 10);
            if (redlock) {
              paramReceivedBagId = await this.createReceivedBag(
                dataReceivedBagCode,
                authMeta.employeeId,
                authMeta.userId,
                permissonPayload.branchId,
                paramTotalSeq,
                paramTotalBagWeight,
                timeNow,
              );
              receivedBagCode = dataReceivedBagCode;
              receivedBagDate = moment(timeNow).format('YYYY-MM-DD HH:mm:ss');
            } else {
              result.message = 'Data Scan In Gab.Paket Sedang di proses, Silahkan Coba Beberapa Saat';
              return result;
            }
          }

          const paramReceivedBagDetailId = await this.createReceivedBagDetail(
            paramReceivedBagId,
            paramBagNumber,
            paramBagSeq,
            payload.bag_item_number,
            weight,
            authMeta.userId,
          );

          if (exist == false) {
            paramBagItemId = await this.createBagItem(
              paramSeq,
              weight,
              paramBagId,
              authMeta.userId,
            );
          } else {
            await BagItem.update(
              { bagItemId : paramBagItemId },
              {
                bagSeq: paramSeq,
                bagId: paramBagId,
                userIdUpdated: authMeta.userId,
                updatedTime: timeNow,
              },
            );
          }
          const resultbagItemHistory = BagItemHistory.create();
          resultbagItemHistory.bagItemId = paramBagItemId.toString();
          resultbagItemHistory.userId = authMeta.userId.toString();
          resultbagItemHistory.branchId = permissonPayload.branchId.toString();
          resultbagItemHistory.historyDate = moment().toDate();
          resultbagItemHistory.bagItemStatusId = BAG_STATUS.DO_LINE_HAUL.toString();
          resultbagItemHistory.userIdCreated = authMeta.userId;
          resultbagItemHistory.createdTime = moment().toDate();
          resultbagItemHistory.userIdUpdated = authMeta.userId;
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
        // NOTE: post awb status in in last transaction when success
        // Loop data bag_item_awb for update status awb
        // TODO: need to refactor
        // send to background job
        BagScanInBranchSmdQueueService.perform(
          paramBagItemId,
          null,
          null,
          authMeta.userId,
          permissonPayload.branchId,
        );
        const showNumber = paramBagNumber + paramBagSeq + ' ('  + weight.toString() + ' Kg) ';
        const message = paramBagNumber + paramBagSeq + ' ('  + weight.toString() + ' Kg) ' + 'Scan IN berhasil';
        const data = [];
        data.push({
          show_number: showNumber,
          id: paramBagNumber + paramBagSeq,
          received_bag_id: paramReceivedBagId,
          received_bag_code: receivedBagCode,
          received_bag_date: receivedBagDate,
          bag_weight: weight,
          bag_number: paramBagNumber,
        });
        result.statusCode = HttpStatus.OK;
        result.message = message;
        result.data = data;
        return result;
      } else {
        result.message = errMessage;
        return result;
      }
    } else {
      result.message = 'Gabung paket tidak valid';
      return result;
    }
  }

  static async scanInBagMore(payload: ScanInSmdMorePayloadVm): Promise<ScanInSmdBagMoreResponseVm> {
    const result = new ScanInSmdBagMoreResponseVm();
    const p = new ScanInSmdPayloadVm();
    let totalError = 0;
    let totalSuccess = 0;
    const uniqueBag = [];

    p.received_bag_id = payload.received_bag_id;
    result.data = [];

    if (typeof(payload.bag_item_number) != 'object') {
      payload.bag_item_number = [payload.bag_item_number];
    }

    // TODO:
    // 1. get response scanInBag of each bag_item_number
    // 2. check and/or update received_bag_id every time scan-in combine package
    // 3. populate total
    for (const itemNumber of payload.bag_item_number) {
      p.bag_item_number = itemNumber;

      // handle duplikat
      const number = itemNumber.substring(0, 10);
      if (uniqueBag.includes(number)) {
        result.data.push({
          statusCode: 400,
          message: `Scan gabung paket ${itemNumber} duplikat!`,
          bag_item_number: itemNumber,
        } as ScanInSmdBagDataResponseVm);
        continue;
      }
      uniqueBag.push(number);

      const res = await this.scanInBag(p);
      result.data.push({
        ...res,
        bag_item_number: itemNumber,
      });
      if (res.statusCode == HttpStatus.OK) {
        p.received_bag_id = p.received_bag_id ? p.received_bag_id :
          Number(res.data && res.data.length > 0 ? res.data[0].received_bag_id : null);
        totalSuccess++;
      } else {
        totalError++;
      }
    }
    result.totalData = payload.bag_item_number.length;
    result.totalSuccess = totalSuccess;
    result.totalError = totalError;
    return result;
  }

  static async scanInDo(payload: any): Promise<any> {
    const result = new ScanInSmdBaggingResponseVm();
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    if (payload.bag_item_number.length > 15) {
      const rawQueryBag = `
        SELECT
          CONCAT(bag.bag_number, LPAD(bagItem.bag_seq::text, 3, '0')) AS bagnumber
        FROM do_pod_detail_bag doPodDetailBag
        INNER JOIN do_pod doPod ON doPod.do_pod_id=doPodDetailBag.do_pod_id AND (doPod.is_deleted = 'false')
        INNER JOIN bag_item bagItem ON bagItem.bag_item_id=doPodDetailBag.bag_item_id AND (bagItem.is_deleted = 'false')
        LEFT JOIN bag bag ON bag.bag_id=bagItem.bag_id AND (bag.is_deleted = 'false')
        LEFT JOIN bag_item_history bih ON bih.bag_item_history_id = bagItem.bag_item_history_id AND bih.branch_id = ${permissonPayload.branchId} AND bih.is_deleted = false
        WHERE
          doPod.do_pod_code = '${payload.bag_item_number}' AND
          doPodDetailBag.is_deleted = false AND
          (bih.bag_item_status_id = 4550 OR bih.bag_item_status_id = 500 OR bih.bag_item_status_id IS NULL)
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
        LEFT JOIN bag_item_history bih ON bih.bag_item_history_id = bagItem.bag_item_history_id AND bih.branch_id = ${permissonPayload.branchId} AND bih.is_deleted = false
        WHERE
          doPod.do_pod_code =  '${payload.bag_item_number}' AND
          doPodDetailBag.is_deleted = false AND
          (bih.bag_item_status_id <> 4550 AND bih.bag_item_status_id <> 500 AND bih.bag_item_status_id IS NOT NULL)
        GROUP BY bagnumber
        `;
      const resultDataBagScanned = await RawQueryService.query(rawQueryBagScanned);
      if (resultDataBag.length > 0) {
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

  static async findScanInList(
    payload: BaseMetaPayloadVm,
  ): Promise<ScanInListResponseVm> {
    // ScanInListResponseVm
    // payload.fieldResolverMap['baggingDateTime'] = 'b.created_time';
    // payload.fieldResolverMap['branchId'] = 'bhin.branch_id';

    payload.fieldResolverMap['bagging_datetime'] = 'b.created_time';
    payload.fieldResolverMap['branch_id'] = 'bhin.branch_id';
    payload.fieldResolverMap['bag_number_seq'] = `CONCAT(b.bag_number, LPAD(bi.bag_seq::text, 3, '0'))`;
    payload.fieldResolverMap['scan_in_datetime'] = 'bhin.history_date';

    payload.globalSearchFields = [
      {
        field: 'bagging_datetime',
      },
      {
        field: 'branch_id',
      },
      {
        field: 'bag_number_seq',
      },
      {
        field: 'scan_in_datetime',
      },
    ];

    const repo = new OrionRepositoryService(Bag, 'b');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['b.bag_id', 'bag_id'],
      ['bi.bag_item_id', 'bag_item_id'],
      [`CONCAT(b.bag_number, LPAD(bi.bag_seq::text, 3, '0'))`, 'bag_number_seq'],
      [`TO_CHAR(b.created_time, 'dd-mm-YYYY HH24:MI:SS')`, 'bagging_datetime'],
      [`CASE
          WHEN bhin.history_date IS NULL THEN 'Belum Scan IN'
          ELSE TO_CHAR(bhin.history_date, 'dd-mm-YYYY HH24:MI:SS')
        END`, 'scan_in_datetime'],
      ['bb.branch_name', 'branch_name'],
      [`CASE
          WHEN b.representative_id_to IS NULL then 'Belum Upload'
          ELSE r.representative_name
        END`, 'representative_name'],
      // [`(
      //   SELECT
      //     count(bia.awb_number)
      //   FROM bag_item_awb bia
      //   INNER JOIN bag_item bitem ON bitem.bag_item_id = bia.bag_item_id AND bitem.is_deleted  = FALSE
      //   WHERE
      //     bitem.bag_id = b.bag_id AND
      //     bia.is_deleted = FALSE
      //   GROUP BY bitem.bag_id)`, 'tot_resi'],
      [`(
        SELECT
          count(bia.awb_number)
        FROM bag_item_awb bia
        WHERE
          bia.bag_item_id = bi.bag_item_id AND
          bia.is_deleted = FALSE
        GROUP BY bia.bag_item_id)`, 'tot_resi'],
      [`CONCAT(bi.weight::numeric(10,2), ' kg')`, 'weight'],
      [`CONCAT(
          CASE
            WHEN bi.weight > 10 THEN bi.weight
            ELSE 10
          END,' kg')`, 'weight_accumulative'],
      [`CONCAT(u.first_name, ' ', u.last_name)`, 'fullname'],

    );

    q.innerJoin(e => e.bagItems, 'bi', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.leftJoin(e => e.branch, 'br', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.leftJoinRaw(
      'bag_item_history',
      'bhin',
      'bhin.bag_item_id = bi.bag_item_id AND bhin.bag_item_status_id = 3550 AND bhin.is_deleted = FALSE',
    );
    q.leftJoin(e => e.representative, 'r', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.leftJoinRaw(
      'branch',
      'bb',
      'bhin.branch_id=bb.branch_id and bb.is_deleted = FALSE ',
    );
    q.leftJoinRaw(
      'users',
      'u',
      'u.user_id=bhin.user_id_updated and u.is_deleted = FALSE ',
    );
    // q.leftJoin(e => e.user, 'u', j =>
    //   j.andWhere(e => e.isDeleted, w => w.isFalse()),
    // );
    q.andWhere(e => e.isDeleted, w => w.isFalse());
    q.andWhereRaw('bhin.bag_item_status_id = 3550');

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new ScanInListResponseVm();

    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;

    // const q = payload.buildQueryBuilder();
    // q.select('b.bag_id', 'bag_id')
    // .addSelect(`CONCAT(b.bag_number, LPAD(bi.bag_seq::text, 3, '0'))`, 'bag_number_seq')
    // .addSelect('br.branch_name', 'branch_name')
    // .addSelect(`TO_CHAR(b.created_time, 'dd-mm-YYYY HH24:MI:SS')`, 'bagging_datetime')
    // .addSelect(`CASE
    //               WHEN bhin.history_date IS NULL THEN 'Belum Scan IN'
    //               ELSE CONCAT(TO_CHAR(bhin.history_date, 'dd-mm-YYYY HH24:MI:SS'),' - ',bb.branch_name)
    //             END`, 'scan_in_datetime')
    // .addSelect(`CASE
    //               WHEN b.representative_id_to IS NULL then 'Belum Upload'
    //               ELSE r.representative_name
    //             END`, 'representative_name')
    // .addSelect('(SELECT count(bag_item_id) FROM bag_item bit where bit.bag_id = b.bag_id GROUP BY bit.bag_id)', 'tot_resi')
    // .addSelect(`CONCAT(bi.weight::numeric(10,2), ' kg')`, 'weight')
    // .addSelect(`CONCAT(
    //               CASE
    //                 WHEN bi.weight > 10 THEN bi.weight
    //                 ELSE 10
    //               END,' kg')`, 'weight_accumulative')
    // .from('bag', 'b')
    // .innerJoin(
    //   'bag_item',
    //   'bi',
    //   'b.bag_id = bi.bag_id AND bi.is_deleted = FALSE',
    // )
    // .leftJoin(
    //   'branch',
    //   'br',
    //   'br.branch_id = b.branch_id',
    // )
    // .leftJoin(
    //   'bag_item_history',
    //   'bhin',
    //   'bhin.bag_item_id = bi.bag_item_id AND bhin.bag_item_status_id = 2000 AND bhin.is_deleted = FALSE',
    // )
    // .leftJoin(
    //   'representative',
    //   'r',
    //   'r.representative_id = b.representative_id_to AND r.is_deleted = FALSE',
    // )
    // .leftJoin(
    //   'branch',
    //   'bb',
    //   'bhin.branch_id=bb.branch_id and bb.is_deleted = FALSE ',
    // )
    // .where('bhin.bag_item_status_id = 2000')
    // .andWhere('b.is_deleted = false');

    // const total = await QueryBuilderService.count(q, '1');
    // payload.applyRawPaginationToQueryBuilder(q);
    // const data = await q.getRawMany();
    // console.log(data);

    // const result = new ScanInListResponseVm();
    // result.data = data;
    // result.paging = MetaService.set(payload.page, payload.limit, total);

    // return result;
  }

  static async findDetailScanInList(
    payload: BaseMetaPayloadVm,
  ): Promise<ScanInDetailListResponseVm> {
    // ScanInListResponseVm
    // payload.fieldResolverMap['bag_id'] = 'bi.bag_id';
    payload.fieldResolverMap['bag_item_id'] = 'bi.bag_item_id';

    payload.globalSearchFields = [
      // {
      //   field: 'bag_id',
      // },
      {
        field: 'bag_item_id',
      },
    ];

    const repo = new OrionRepositoryService(BagItemAwb, 'bia');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['bia.awb_number', 'awb_number'],
    );
    q.innerJoin(e => e.bagItem, 'bi', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.andWhere(e => e.isDeleted, w => w.isFalse());

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new ScanInDetailListResponseVm();

    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
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

  static async detailScaninScanned(
    payload: ScaninDetailScanPayloadVm,
    ): Promise<ScaninDetailScanResponseVm> {
    const result = new ScaninDetailScanResponseVm();
    const qb = createQueryBuilder();
    qb.addSelect( 'rb.received_bag_id', 'received_bag_id');
    qb.addSelect( 'rb.received_bag_code', 'received_bag_code');
    qb.addSelect( 'rb.received_bag_date', 'received_bag_date');
    qb.addSelect( 'rbd.bag_weight', 'bag_weight');
    qb.addSelect( 'rbd.bag_number', 'bag_number');
    qb.from('received_bag', 'rb');
    qb.innerJoin('received_bag_detail', 'rbd', 'rbd.received_bag_id = rb.received_bag_id AND rbd.is_deleted = FALSE');
    qb.andWhere(`rbd.received_bag_id = '${payload.received_bag_id}'`);
    qb.andWhere(`rb.is_deleted = FALSE`);
    result.data = await qb.getRawMany();

    return result;
  }
}
