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
import { BagItem } from '../../../../shared/orm-entity/bag-item';
import { BagItemHistory } from '../../../../shared/orm-entity/bag-item-history';
import { ScanOutSmdVehicleResponseVm, ScanOutSmdRouteResponseVm } from '../../models/scanout-smd.response.vm';
import { HttpStatus } from '@nestjs/common';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { CustomCounterCode } from '../../../../shared/services/custom-counter-code.service';
import { AuthService } from '../../../../shared/services/auth.service';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { QueryBuilderService } from '../../../../shared/services/query-builder.service';
import { MetaService } from '../../../../shared/services/meta.service';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { WebScanInHubSortListResponseVm } from '../../../main/models/web-scanin-list.response.vm';
import { BAG_STATUS } from '../../../../shared/constants/bag-status.constant';
import { DoSmd } from '../../../../shared/orm-entity/do_smd';
import { DoSmdVehicle } from '../../../../shared/orm-entity/do_smd_vehicle';
import { DoSmdDetail } from '../../../../shared/orm-entity/do_smd_detail';
import { Branch } from '../../../../shared/orm-entity/branch';
import { Representative } from '../../../../shared/orm-entity/representative';
import { Bagging } from '../../../../shared/orm-entity/bagging';
import { BaggingItem } from '../../../../shared/orm-entity/bagging-item';
import { DoSmdDetailItem } from '../../../../shared/orm-entity/do_smd_detail_item';

@Injectable()
export class ScanoutSmdService {
  static async scanOutVehicle(payload: any): Promise<any> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    const result = new ScanOutSmdVehicleResponseVm();
    const timeNow = moment().toDate();
    const paramDoSmdCode = await CustomCounterCode.doSmdCodeCounter(timeNow);

    const paramDoSmdId = await this.createDoSmd(
      paramDoSmdCode,
      payload.smd_date,
      permissonPayload.branchId,
      authMeta.userId,
    );

    const paramDoSmdVehicleId = await this.createDoSmdVehicle(
      paramDoSmdId,
      payload.vehicle_number,
      payload.employee_id_driver,
      permissonPayload.branchId,
      authMeta.userId,
    );

    await DoSmd.update(
      { doSmdId : paramDoSmdId },
      {
        doSmdVehicleIdLast: paramDoSmdVehicleId,
        userIdUpdated: authMeta.userId,
        updatedTime: timeNow,
      },
    );

    const data = [];
    data.push({
      do_smd_id: paramDoSmdId,
      do_smd_code: paramDoSmdCode,
      do_smd_vehicle_id: paramDoSmdVehicleId,
      departure_schedule_date_time: payload.do_smd_time,
    });
    result.statusCode = HttpStatus.OK;
    result.message = 'SMD Success Created';
    result.data = data;
    return result;

  }

  static async scanOutRoute(payload: any): Promise<any> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    const result = new ScanOutSmdRouteResponseVm();
    const timeNow = moment().toDate();
    const data = [];

    const resultDoSmd = await DoSmd.findOne({
      where: {
        doSmdId: payload.do_smd_id,
        isDeleted: false,
      },
    });

    if (resultDoSmd) {

      const resultbranchTo = await Branch.findOne({
        where: {
          branchCode: payload.branch_code,
          isDeleted: false,
        },
      });

      if (resultbranchTo) {
        const resultRepresentative = await Representative.findOne({
          where: {
            representativeCode: payload.representative_code,
            isDeleted: false,
          },
        });
        if (resultRepresentative) {
          const resultDoSmdDetail = await DoSmdDetail.findOne({
            where: {
              doSmdId: resultDoSmd.doSmdId,
              branchIdTo: resultbranchTo.branchId,
              isDeleted: false,
            },
          });
          if (resultDoSmdDetail) {
            const rawQuery = `
              SELECT
                do_smd_detail_id ,
                representative_code_list
              FROM do_smd_detail , unnest(string_to_array(representative_code_list , ','))  s(code)
              where
                s.code  = '${escape(payload.representative_code)}' AND
                do_smd_id = ${payload.do_smd_id} AND
                is_deleted = FALSE;
            `;
            const resultDataRepresentative = await RawQueryService.query(rawQuery);

            if (resultDataRepresentative.length > 0) {
              throw new BadRequestException(`Representative Code already scan !!`);
            } else {
              await DoSmdDetail.update(
                { doSmdDetailId : resultDoSmdDetail.doSmdDetailId },
                {
                  representativeCodeList: resultDoSmdDetail.representativeCodeList + ',' + payload.representative_code,
                  userIdUpdated: authMeta.userId,
                  updatedTime: timeNow,
                },
              );

              data.push({
                do_smd_id: resultDoSmd.doSmdId,
                do_smd_code: resultDoSmd.doSmdCode,
                do_smd_detail_id: resultDoSmdDetail.doSmdDetailId,
                branch_name: resultbranchTo.branchName,
                representative_code_list: resultDoSmdDetail.representativeCodeList + ',' + payload.representative_code,
              });
              result.statusCode = HttpStatus.OK;
              result.message = 'SMD Route Success Upated';
              result.data = data;
              return result;
            }
          } else {
            const rawQuery = `
              SELECT
                do_smd_detail_id ,
                representative_code_list
              FROM do_smd_detail , unnest(string_to_array(representative_code_list , ','))  s(code)
              where
                s.code  = '${escape(payload.representative_code)}' AND
                do_smd_id = ${payload.do_smd_id} AND
                is_deleted = FALSE;
            `;
            const resultDataRepresentative = await RawQueryService.query(rawQuery);

            if (resultDataRepresentative.length > 0) {
              throw new BadRequestException(`Representative Code already scan !!`);
            } else {
              const paramDoSmdDetailId = await this.createDoSmdDetail(
                resultDoSmd.doSmdId,
                resultDoSmd.doSmdVehicleIdLast,
                payload.representative_code,
                resultDoSmd.doSmdTime,
                permissonPayload.branchId,
                resultbranchTo.branchId,
                authMeta.userId,
              );

              await DoSmd.update(
                { doSmdId : resultDoSmd.doSmdId },
                {
                  totalDetail: resultDoSmd.totalDetail + 1,
                  userIdUpdated: authMeta.userId,
                  updatedTime: timeNow,
                },
              );

              data.push({
                do_smd_id: resultDoSmd.doSmdId,
                do_smd_code: resultDoSmd.doSmdCode,
                do_smd_detail_id: paramDoSmdDetailId,
                branch_name: resultbranchTo.branchName,
                representative_code_list: payload.representative_code,
              });
              result.statusCode = HttpStatus.OK;
              result.message = 'SMD Route Success Created';
              result.data = data;
              return result;
            }
          }
        } else {
          throw new BadRequestException(`Can't Find  Representative Code : ` + payload.representative_code);
        }

      } else {
        throw new BadRequestException(`Can't Find  Branch Code : ` + payload.branch_code);
      }

    } else {
      throw new BadRequestException(`Can't Find  DO SMD ID : ` + payload.do_smd_id.toString());
    }

  }

  static async scanOutItem(payload: any): Promise<any> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    const result = new ScanOutSmdRouteResponseVm();
    const timeNow = moment().toDate();
    const data = [];
    let rawQuery;
    const resultBagging = await Bagging.findOne({
      where: {
        baggingCode: payload.item_number,
        isDeleted: false,
      },
    });

    if (resultBagging) {
      rawQuery = `
        SELECT
          bg.bagging_id,
          b.bag_id,
          bi.bag_item_id ,
          r.representative_code
        FROM bag_item bi
        INNER JOIN bagging_item bgi ON bi.bag_item_id = bgi.bag_item_id AND bgi.is_deleted = FALSE
        INNER JOIN bagging bg ON bgi.bagging_id = bg.bagging_id AND bg.is_deleted = FALSE
        INNER JOIN bag b ON bi.bag_id = b.bag_id AND b.is_deleted = FALSE
        LEFT JOIN representative  r on bg.representative_id_to = r.representative_id and r.is_deleted  = FALSE
        WHERE
          bg.bagging_id = ${resultBagging.baggingId} AND
          bi.is_deleted = FALSE;
      `;
      const resultDataBagItem = await RawQueryService.query(rawQuery);
      if (resultDataBagItem.length > 0) {
        rawQuery = `
          SELECT
            do_smd_detail_id ,
            representative_code_list,
            total_bagging
          FROM do_smd_detail , unnest(string_to_array(representative_code_list , ','))  s(code)
          where
            s.code  = '${escape(resultDataBagItem[0].representative_code)}' AND
            do_smd_id = ${payload.do_smd_id} AND
            is_deleted = FALSE;
        `;
        const resultDataRepresentative = await RawQueryService.query(rawQuery);
        if (resultDataRepresentative) {
          for (let i = 0; i < resultDataBagItem.length; i++) {
            // Insert Do SMD DETAIL ITEM & Update DO SMD DETAIL TOT BAGGING
            // customer.awbStatusName = data[i].awbStatusName;
            //  BAG TYPE 0 = Bagging, 1 = Bag / Gab. Paket
            const paramDoSmdDetailItemId = await this.createDoSmdDetailItem(
              resultDataRepresentative[0].do_smd_detail_id,
              permissonPayload.branchId,
              resultDataBagItem[i].bag_item_id,
              resultDataBagItem[i].bag_id,
              resultDataBagItem[i].bagging_id,
              0,
              authMeta.userId,
            );
          }

          await DoSmdDetail.update(
            { doSmdDetailId : resultDataRepresentative[0].do_smd_detail_id },
            {
              totalBagging: resultDataRepresentative[0].total_bagging + 1,
              userIdUpdated: authMeta.userId,
              updatedTime: timeNow,
            },
          );

        } else {
          throw new BadRequestException(`Representative To Bagging Not Match`);
        }
      } else {
        throw new BadRequestException(`Bagging Item Not Found`);
      }
    } else {
      // cari di bag code
      rawQuery = `
        SELECT
          do_smd_detail_id ,
          representative_code_list
        FROM do_smd_detail , unnest(string_to_array(representative_code_list , ','))  s(code)
        where
          s.code  = '${escape(payload.representative_code)}' AND
          do_smd_id = ${payload.do_smd_id} AND
          is_deleted = FALSE;
      `;
      const resultDataRepresentative = await RawQueryService.query(rawQuery);

      if (resultDataRepresentative.length > 0) {

      } else {
        throw new BadRequestException(`Bagging / Bag Not Found`);
      }
    }

  }

  private static async createDoSmd(
    paramDoSmdCode: string,
    paramDoSmdTime: Date,
    paramBranchId: number,
    userId: number,
  ) {
    const dataDoSmd = DoSmd.create({
      doSmdCode: paramDoSmdCode,
      doSmdTime: paramDoSmdTime,
      userId,
      branchId: paramBranchId,
      totalVehicle: 1,
      userIdCreated: userId,
      createdTime: moment().toDate(),
      userIdUpdated: userId,
      updatedTime: moment().toDate(),
    });
    const doSmd = await DoSmd.insert(dataDoSmd);
    return doSmd.identifiers.length
      ? doSmd.identifiers[0].doSmdId
      : null;
  }

  private static async createDoSmdVehicle(
    paramDoSmdId: number,
    paramVehicleNumber: string,
    paramEmployeeId: number,
    paramBranchId: number,
    userId: number,
  ) {
    const dataDoSmdVehicle = DoSmdVehicle.create({
      doSmdId: paramDoSmdId,
      vehicleNumber: paramVehicleNumber,
      employeeIdDriver: paramEmployeeId,
      branchIdStart: paramBranchId,
      userIdCreated: userId,
      createdTime: moment().toDate(),
      userIdUpdated: userId,
      updatedTime: moment().toDate(),
    });
    const doSmdVehicle = await DoSmdVehicle.insert(dataDoSmdVehicle);
    return doSmdVehicle.identifiers.length
      ? doSmdVehicle.identifiers[0].doSmdVehicleId
      : null;
  }

  private static async createDoSmdDetail(
    paramDoSmdId: number,
    paramDoSmdVehicleId: number,
    paramrepresentativeCode: string,
    paramDoSmdDepartureScheduleDate: Date,
    paramBranchId: number,
    paramBranchIdTo: number,
    userId: number,
  ) {
    const dataDoSmdDetail = DoSmdDetail.create({
      doSmdId: paramDoSmdId,
      doSmdVehicleId: paramDoSmdVehicleId,
      userId,
      branchId: paramBranchId,
      branchIdFrom: paramBranchId,
      branchIdTo: paramBranchIdTo,
      representativeCodeList: paramrepresentativeCode,
      departureScheduleDateTime: paramDoSmdDepartureScheduleDate,
      userIdCreated: userId,
      createdTime: moment().toDate(),
      userIdUpdated: userId,
      updatedTime: moment().toDate(),
    });
    const doSmdDetail = await DoSmdDetail.insert(dataDoSmdDetail);
    return doSmdDetail.identifiers.length
      ? doSmdDetail.identifiers[0].doSmdDetailId
      : null;
  }

  private static async createDoSmdDetailItem(
    paramDoSmdDetailId: number,
    paramBranchId: number,
    paramBagItemId: number,
    paramBagId: number,
    paramBaggingId: number,
    paramBagType: number,
    userId: number,
  ) {
    const dataDoSmdDetailItem = DoSmdDetailItem.create({
      doSmdDetailId: paramDoSmdDetailId,
      userIdScan: userId,
      branchIdScan: paramBranchId,
      bagItemId: paramBagItemId,
      bagId: paramBagId,
      baggingId: paramBaggingId,
      bagType: paramBagType,
      userIdCreated: userId,
      createdTime: moment().toDate(),
      userIdUpdated: userId,
      updatedTime: moment().toDate(),
    });
    const doSmdDetailItem = await DoSmdDetailItem.insert(dataDoSmdDetailItem);
    return doSmdDetailItem.identifiers.length
      ? doSmdDetailItem.identifiers[0].doSmdDetailItemId
      : null;
  }

  private static async createDoSmdHistory(
    paramDoSmdId: number,
    paramDoSmdVehicleId: number,
    paramrepresentativeCode: string,
    paramDoSmdDepartureScheduleDate: Date,
    paramBranchId: number,
    paramBranchIdTo: number,
    userId: number,
  ) {
    const dataDoSmdDetail = DoSmdDetail.create({
      doSmdId: paramDoSmdId,
      doSmdVehicleId: paramDoSmdVehicleId,
      userId,
      branchId: paramBranchId,
      branchIdFrom: paramBranchId,
      branchIdTo: paramBranchIdTo,
      representativeCodeList: paramrepresentativeCode,
      departureScheduleDateTime: paramDoSmdDepartureScheduleDate,
      userIdCreated: userId,
      createdTime: moment().toDate(),
      userIdUpdated: userId,
      updatedTime: moment().toDate(),
    });
    const doSmdDetail = await DoSmd.insert(dataDoSmdDetail);
    return doSmdDetail.identifiers.length
      ? doSmdDetail.identifiers[0].doSmdDetailId
      : null;
  }

}
