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
import { ScanOutSmdVehicleResponseVm, ScanOutSmdRouteResponseVm, ScanOutSmdItemResponseVm, ScanOutSmdSealResponseVm, ScanOutListResponseVm, ScanOutHistoryResponseVm, ScanOutSmdHandoverResponseVm, ScanOutSmdDetailResponseVm, ScanOutSmdDetailBaggingResponseVm } from '../../models/scanout-smd.response.vm';
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
import { DoSmdHistory } from '../../../../shared/orm-entity/do_smd_history';
import { createQueryBuilder } from 'typeorm';

@Injectable()
export class MobileSmdService {

  public static async getHistoryByRequest(doPodDeliverDetailId: string) {
    const qb = createQueryBuilder();
    qb.addSelect(
      'dsd.do_smd_detail_id',
      'doPodDeliverHistoryId',
    );
    qb.addSelect(
      'do_pod_deliver_history.history_date_time',
      'historyDateTime',
    );
    qb.addSelect('reason.reason_id', 'reasonId');
    qb.addSelect('reason.reason_code', 'reasonCode');
    qb.addSelect('do_pod_deliver_history.desc', 'reasonNotes');
    qb.addSelect('employee_history.employee_id', 'employeeId');
    qb.addSelect('employee_history.fullname', 'employeeName');
    qb.addSelect(
      'do_pod_deliver_history.awb_status_id',
      'awbStatusId',
    );
    qb.addSelect(
      'awb_status.awb_status_name',
      'awbStatusCode',
    );
    qb.addSelect(
      'awb_status.awb_status_title',
      'awbStatusName',
    );
    qb.addSelect(
      'do_pod_deliver_history.latitude_delivery',
      'latitudeDelivery',
    );
    qb.addSelect(
      'do_pod_deliver_history.longitude_delivery',
      'longitudeDelivery',
    );
    qb.from('do_pod_deliver_history', 'do_pod_deliver_history');
    qb.leftJoin(
      'reason',
      'reason',
      'reason.reason_id = do_pod_deliver_history.reason_id',
    );
    qb.leftJoin(
      'awb_status',
      'awb_status',
      'awb_status.awb_status_id = do_pod_deliver_history.awb_status_id',
    );
    qb.leftJoin(
      'employee',
      'employee_history',
      'employee_history.employee_id = do_pod_deliver_history.employee_id_driver',
    );
    qb.where(
      'do_pod_deliver_history.do_pod_deliver_detail_id = :doPodDeliverDetailId',
      {
        doPodDeliverDetailId,
      },
    );
    qb.andWhere('do_pod_deliver_history.is_deleted = false');
    return await qb.getRawMany();
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
                  branchToNameList: (resultDoSmd.branchToNameList) ? resultDoSmd.branchToNameList + ',' + resultbranchTo.branchName : resultbranchTo.branchName,
                  doSmdDetailIdLast: paramDoSmdDetailId,
                  totalDetail: resultDoSmd.totalDetail + 1,
                  userIdUpdated: authMeta.userId,
                  updatedTime: timeNow,
                },
              );

              // const paramDoSmdHistoryId = await this.createDoSmdHistory(
              //   resultDoSmd.doSmdId,
              //   paramDoSmdDetailId,
              //   resultDoSmd.doSmdVehicleIdLast,
              //   null,
              //   null,
              //   resultDoSmd.doSmdTime,
              //   permissonPayload.branchId,
              //   1000,
              //   null,
              //   null,
              //   authMeta.userId,
              // );

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

    const result = new ScanOutSmdItemResponseVm();
    const timeNow = moment().toDate();
    const data = [];
    let rawQuery;
    const resultBagging = await Bagging.findOne({
      where: {
        baggingCode: payload.item_number,
        isDeleted: false,
      },
    });

    const resultDoSmd = await DoSmd.findOne({
      where: {
        doSmdId: payload.do_smd_id,
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
        if (resultDataRepresentative.length > 0) {
          const resultDoSmdDetailItem = await DoSmdDetailItem.findOne({
            where: {
              doSmdDetailId: resultDataRepresentative[0].do_smd_detail_id,
              baggingId: resultBagging.baggingId,
              isDeleted: false,
            },
          });
          if (resultDoSmdDetailItem) {
            throw new BadRequestException(`Bagging Already Scanned`);
          } else {
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
            const resultDoSmdDetail = await DoSmdDetail.findOne({
              where: {
                doSmdDetailId: resultDataRepresentative[0].do_smd_detail_id,
                isDeleted: false,
              },
            });

            await DoSmd.update(
              { doSmdId : payload.do_smd_id },
              {
                totalBagging: resultDoSmd.totalBagging + 1,
                userIdUpdated: authMeta.userId,
                updatedTime: timeNow,
              },
            );

            data.push({
              do_smd_detail_id: resultDataRepresentative[0].do_smd_detail_id,
              bagging_id: resultDataBagItem[0].bagging_id,
              bag_id: null,
              bag_item_id: null,
              bag_type: 0,
              bag_number: null,
              bagging_number: payload.item_number,
              total_bag: resultDoSmdDetail.totalBag,
              total_bagging: resultDoSmdDetail.totalBagging,
            });
            result.statusCode = HttpStatus.OK;
            result.message = 'SMD Route Success Created';
            result.data = data;
            return result;
          }
        } else {
          throw new BadRequestException(`Representative To Bagging Not Match`);
        }
      } else {
        throw new BadRequestException(`Bagging Item Not Found`);
      }
    } else {
      // cari di bag code
      if (payload.item_number.length == 15) {
        const paramBagNumber = payload.item_number.substr( 0 , (payload.item_number.length) - 8 );
        const paramWeightStr = await payload.item_number.substr(payload.item_number.length - 5);
        const paramBagSeq = await payload.item_number.substr( (payload.item_number.length) - 8 , 3);
        const paramSeq = await paramBagSeq * 1;
        const weight = parseFloat(paramWeightStr.substr(0, 2) + '.' + paramWeightStr.substr(2, 2));
        rawQuery = `
          SELECT
            bi.bag_item_id,
            b.bag_id,
            b.representative_id_to,
            r.representative_code
          FROM bag_item bi
          INNER JOIN bag b ON b.bag_id = bi.bag_id AND b.is_deleted = FALSE
          LEFT JOIN representative  r on b.representative_id_to = r.representative_id and r.is_deleted  = FALSE
          WHERE
            b.bag_number = '${escape(paramBagNumber)}' AND
            bi.bag_seq = '${paramSeq}' AND
            bi.is_deleted = FALSE;
        `;
        const resultDataBag = await RawQueryService.query(rawQuery);
        if (resultDataBag.length > 0) {

          rawQuery = `
            SELECT
              do_smd_detail_id ,
              representative_code_list,
              total_bag
            FROM do_smd_detail , unnest(string_to_array(representative_code_list , ','))  s(code)
            where
              s.code  = '${escape(resultDataBag[0].representative_code)}' AND
              do_smd_id = ${payload.do_smd_id} AND
              is_deleted = FALSE;
          `;
          const resultDataRepresentative = await RawQueryService.query(rawQuery);

          if (resultDataRepresentative.length > 0) {
            // for (let i = 0; i < resultDataBag.length; i++) {
              // Insert Do SMD DETAIL ITEM & Update DO SMD DETAIL TOT BAGGING
              // customer.awbStatusName = data[i].awbStatusName;
              //  BAG TYPE 0 = Bagging, 1 = Bag / Gab. Paket
              const paramDoSmdDetailItemId = await this.createDoSmdDetailItem(
                resultDataRepresentative[0].do_smd_detail_id,
                permissonPayload.branchId,
                resultDataBag[0].bag_item_id,
                resultDataBag[0].bag_id,
                null,
                1,
                authMeta.userId,
              );
            // }

              await DoSmdDetail.update(
                { doSmdDetailId : resultDataRepresentative[0].do_smd_detail_id },
                {
                  totalBag: resultDataRepresentative[0].total_bag + 1,
                  userIdUpdated: authMeta.userId,
                  updatedTime: timeNow,
                },
              );

              const resultDoSmdDetail = await DoSmdDetail.findOne({
                where: {
                  doSmdDetailId: resultDataRepresentative[0].do_smd_detail_id,
                  isDeleted: false,
                },
              });

              await DoSmd.update(
                { doSmdId : payload.do_smd_id },
                {
                  totalBagging: resultDoSmd.totalBag + 1,
                  userIdUpdated: authMeta.userId,
                  updatedTime: timeNow,
                },
              );
              data.push({
                do_smd_detail_id: resultDataRepresentative[0].do_smd_detail_id,
                bagging_id: null,
                bag_id: resultDataBag[0].bag_id,
                bag_item_id: resultDataBag[0].bag_item_id,
                bag_type: 1,
                bag_number: payload.item_number,
                bagging_number: null,
                total_bag: resultDoSmdDetail.totalBag,
                total_bagging: resultDoSmdDetail.totalBagging,
              });
              result.statusCode = HttpStatus.OK;
              result.message = 'SMD Route Success Created';
              result.data = data;
              return result;
          } else {
            throw new BadRequestException(`Representative To Bag Not Match`);
          }
        } else {
          throw new BadRequestException(`Bag Not Found`);
        }
      } else {
        throw new BadRequestException(`Bagging / Bag Not Found`);
      }
    }

  }

  static async scanOutSeal(payload: any): Promise<any> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    const result = new ScanOutSmdSealResponseVm();
    const timeNow = moment().toDate();
    const data = [];
    let rawQuery;

    rawQuery = `
      SELECT
        do_smd_detail_id
      FROM do_smd_detail
      WHERE
        do_smd_id = ${payload.do_smd_id} AND
        arrival_time IS NULL AND
        seal_number IS NULL AND
        is_deleted = FALSE
       ;
    `;
    const resultDataDoSmdDetail = await RawQueryService.query(rawQuery);
    if (resultDataDoSmdDetail.length > 0 ) {
      for (let i = 0; i < resultDataDoSmdDetail.length; i++) {
        await DoSmdDetail.update(
          { doSmdDetailId : resultDataDoSmdDetail[i].do_smd_detail_id },
          {
            sealNumber: payload.seal_number,
            userIdUpdated: authMeta.userId,
            updatedTime: timeNow,
          },
        );
      }
      const resultDoSmd = await DoSmd.findOne({
        where: {
          doSmdId: payload.do_smd_id,
          isDeleted: false,
        },
      });
      let paramStatusId;
      if (payload.seal_seq == 1) {
        // Untuk Seal Pertama X
        paramStatusId = 2000;
      } else {
        //  Untuk Ganti Seal
        paramStatusId = 1200;
      }
      const paramDoSmdHistoryId = await this.createDoSmdHistory(
        resultDoSmd.doSmdId,
        null,
        resultDoSmd.doSmdVehicleIdLast,
        null,
        null,
        resultDoSmd.doSmdTime,
        permissonPayload.branchId,
        paramStatusId,
        payload.seal_number,
        null,
        authMeta.userId,
      );
      data.push({
        do_smd_id: resultDoSmd.doSmdId,
        do_smd_code: resultDoSmd.doSmdCode,
        seal_number: payload.seal_number,
      });
      result.statusCode = HttpStatus.OK;
      result.message = 'SMD Code ' + resultDoSmd.doSmdCode + ' With Seal ' + payload.seal_number + 'Success Created';
      result.data = data;
      return result;
    } else {
      throw new BadRequestException(`Updated Seal Fail`);
    }
  }

  public static async deleteSmd(paramdoSmdId: number) {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    const resultDoSmd = await DoSmd.findOne({
      where: {
        doSmdId: paramdoSmdId,
        isDeleted: false,
      },
    });
    if (resultDoSmd) {
      await DoSmd.update(
        { doSmdId : paramdoSmdId },
        {
          isDeleted: true,
          userIdUpdated: authMeta.userId,
          updatedTime: moment().toDate(),
        },
      );
      const rawQuery = `
        SELECT
          do_smd_detail_id
        FROM do_smd_detail
        WHERE
          do_smd_id = ${paramdoSmdId} AND
          is_deleted = FALSE;
      `;
      const resultDataDoSmdDetail = await RawQueryService.query(rawQuery);
      if (resultDataDoSmdDetail.length > 0 ) {
        await DoSmdDetail.update(
          { doSmdId : paramdoSmdId },
          {
            isDeleted: true,
            userIdUpdated: authMeta.userId,
            updatedTime: moment().toDate(),
          },
        );
        await DoSmdVehicle.update(
          { doSmdId : paramdoSmdId },
          {
            isDeleted: true,
            userIdUpdated: authMeta.userId,
            updatedTime: moment().toDate(),
          },
        );
        for (let i = 0; i < resultDataDoSmdDetail.length; i++) {
          await DoSmdDetailItem.update(
            { doSmdDetailId : resultDataDoSmdDetail[i].do_smd_detail_id },
            {
              isDeleted: true,
              userIdUpdated: authMeta.userId,
              updatedTime: moment().toDate(),
            },
          );
        }
        const paramDoSmdHistoryId = await this.createDoSmdHistory(
          resultDoSmd.doSmdId,
          null,
          resultDoSmd.doSmdVehicleIdLast,
          null,
          null,
          resultDoSmd.doSmdTime,
          permissonPayload.branchId,
          7000,
          null,
          null,
          authMeta.userId,
        );
      }
    } else {
      throw new BadRequestException(`SMD ID: ` + paramdoSmdId + ` Can't Found !`);
    }
  }

  static async scanOutHandover(payload: any): Promise<any> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    const result = new ScanOutSmdHandoverResponseVm();
    const timeNow = moment().toDate();
    const data = [];

    const resultDoSmd = await DoSmd.findOne({
      where: {
        doSmdId: payload.do_smd_id,
        isDeleted: false,
      },
    });
    if (resultDoSmd) {
      const rawQuery = `
        SELECT
          do_smd_vehicle_id
        FROM do_smd_vehicle
        WHERE
          do_smd_vehicle_id = ${resultDoSmd.doSmdVehicleIdLast} AND
          is_active = TRUE AND
          reason_id IS NOT NULL AND
          is_deleted = FALSE;
      `;
      const resultDataDoSmdVehicle = await RawQueryService.query(rawQuery);
      if (resultDataDoSmdVehicle.length > 0 ) {
        // Set Active False yang lama
        await DoSmdVehicle.update(
          { doSmdVehicleId : resultDataDoSmdVehicle[0].do_smd_vehicle_id },
          {
            isActive: false,
            userIdUpdated: authMeta.userId,
            updatedTime: moment().toDate(),
          },
        );
        // Create Vehicle Dulu dan jangan update ke do_smd
        const paramDoSmdVehicleId = await this.createDoSmdVehicle(
          payload.do_smd_id,
          payload.vehicle_number,
          payload.employee_id_driver,
          permissonPayload.branchId,
          authMeta.userId,
        );

        const paramDoSmdHistoryId = await this.createDoSmdHistory(
          resultDoSmd.doSmdId,
          null,
          resultDoSmd.doSmdVehicleIdLast,
          null,
          null,
          resultDoSmd.doSmdTime,
          permissonPayload.branchId,
          1150,
          null,
          null,
          authMeta.userId,
        );

        data.push({
          do_smd_id: resultDoSmd.doSmdId,
          do_smd_code: resultDoSmd.doSmdCode,
          do_smd_vehicle_id: paramDoSmdVehicleId,
        });

        result.statusCode = HttpStatus.OK;
        result.message = 'SMD Code ' + resultDoSmd.doSmdCode + 'Success Handover';
        result.data = data;
        return result;
      } else {
        throw new BadRequestException(`Can't Found Trouble Reason For SMD: ` + resultDoSmd.doSmdCode);
      }
    } else {
      throw new BadRequestException(`SMD ID: ` + payload.do_smd_id + ` Can't Found !`);
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
      departureScheduleDateTime: paramDoSmdTime,
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
    paramDoSmdDetailId: number,
    paramDoSmdVehicleId: number,
    paramLatitude: string,
    paramLongitude: string,
    paramDoSmdDepartureScheduleDate: Date,
    paramBranchId: number,
    paramDoSmdStatusId: number,
    paramSealNumber: string,
    paramReasonId: number,
    userId: number,
  ) {
    const dataDoSmdHistory = DoSmdHistory.create({
      doSmdId: paramDoSmdId,
      doSmdDetailId: paramDoSmdDetailId,
      doSmdTime: paramDoSmdDepartureScheduleDate,
      doSmdVehicleId: paramDoSmdVehicleId,
      userId,
      branchId: paramBranchId,
      latitude: paramLatitude,
      longitude: paramLongitude,
      doSmdStatusId: paramDoSmdStatusId,
      departureScheduleDateTime: paramDoSmdDepartureScheduleDate,
      sealNumber: paramSealNumber,
      reasonId: paramReasonId,
      userIdCreated: userId,
      createdTime: moment().toDate(),
      userIdUpdated: userId,
      updatedTime: moment().toDate(),
    });
    const doSmdHistory = await DoSmdHistory.insert(dataDoSmdHistory);
    return doSmdHistory.identifiers.length
      ? doSmdHistory.identifiers[0].doSmdHistoryId
      : null;
  }

}
