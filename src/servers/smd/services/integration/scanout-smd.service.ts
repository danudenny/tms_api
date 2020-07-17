import { Injectable } from '@nestjs/common';
import moment = require('moment');
import { BadRequestException } from '@nestjs/common';
import { RawQueryService } from '../../../../shared/services/raw-query.service';
import { ScanOutSmdVehicleResponseVm, ScanOutSmdRouteResponseVm, ScanOutSmdItemResponseVm, ScanOutSmdSealResponseVm, ScanOutListResponseVm, ScanOutHistoryResponseVm, ScanOutSmdHandoverResponseVm, ScanOutSmdDetailResponseVm, ScanOutSmdDetailBaggingResponseVm } from '../../models/scanout-smd.response.vm';
import { HttpStatus } from '@nestjs/common';
import { CustomCounterCode } from '../../../../shared/services/custom-counter-code.service';
import { AuthService } from '../../../../shared/services/auth.service';
import { Branch } from '../../../../shared/orm-entity/branch';
import { Representative } from '../../../../shared/orm-entity/representative';
import { Bagging } from '../../../../shared/orm-entity/bagging';
import { In } from 'typeorm';
import { DoSmd } from '../../../../shared/orm-entity/do_smd';
import { DoSmdDetail } from '../../../../shared/orm-entity/do_smd_detail';
import { DoSmdDetailItem } from '../../../../shared/orm-entity/do_smd_detail_item';
import { BagScanDoSmdQueueService } from '../../../queue/services/bag-scan-do-smd-queue.service';
import { DoSmdVehicle } from '../../../../shared/orm-entity/do_smd_vehicle';
import { DoSmdHistory } from '../../../../shared/orm-entity/do_smd_history';
import { BAG_STATUS } from '../../../../shared/constants/bag-status.constant';
import { BagItemHistory } from '../../../../shared/orm-entity/bag-item-history';
import { BagAwbDeleteHistoryInHubFromSmdQueueService } from '../../../queue/services/bag-awb-delete-history-in-hub-from-smd-queue.service';

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

    const paramDoSmdHistoryId = await this.createDoSmdHistory(
      paramDoSmdId,
      null,
      paramDoSmdVehicleId,
      null,
      null,
      payload.smd_date,
      permissonPayload.branchId,
      1000,
      null,
      null,
      authMeta.userId,
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

  static async scanOutRouteOld(payload: any): Promise<any> {
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

  static async scanOutRoute(payload: any): Promise<any> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    const result = new ScanOutSmdRouteResponseVm();
    const timeNow = moment().toDate();
    const data = [];
    let paramsresultDoSmdDetailId;

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
          const representaiverawQuery = `
            SELECT
              representative_code
            FROM representative
            where
              representative_smd_id_parent  = ${resultRepresentative.representativeId} AND
              is_deleted = FALSE;
          `;
          const resultDataRepresentativeChild = await RawQueryService.query(representaiverawQuery);
          if (resultDataRepresentativeChild.length > 0) {
            // For
            for (let i = 0; i < resultDataRepresentativeChild.length; i++) {
                const resultDoSmdDetail = await DoSmdDetail.findOne({
                  where: {
                    doSmdId: resultDoSmd.doSmdId,
                    branchIdTo: resultbranchTo.branchId,
                    isDeleted: false,
                  },
                });
                if (resultDoSmdDetail) {
                  paramsresultDoSmdDetailId = resultDoSmdDetail.doSmdDetailId;
                  const rawQuery = `
                  SELECT
                    do_smd_detail_id ,
                    representative_code_list
                  FROM do_smd_detail , unnest(string_to_array(representative_code_list , ','))  s(code)
                  where
                    s.code  = '${escape(resultDataRepresentativeChild[i].representative_code)}' AND
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
                      representativeCodeList: resultDoSmdDetail.representativeCodeList + ',' + resultDataRepresentativeChild[i].representative_code,
                      userIdUpdated: authMeta.userId,
                      updatedTime: timeNow,
                    },
                  );

                  // data.push({
                  //   do_smd_id: resultDoSmd.doSmdId,
                  //   do_smd_code: resultDoSmd.doSmdCode,
                  //   do_smd_detail_id: resultDoSmdDetail.doSmdDetailId,
                  //   branch_name: resultbranchTo.branchName,
                  //   representative_code_list: resultDoSmdDetail.representativeCodeList + ',' + resultDataRepresentativeChild[i].representative_code,
                  // });
                  // result.statusCode = HttpStatus.OK;
                  // result.message = 'SMD Route Success Upated';
                  // result.data = data;
                  // return result;
                }
              } else {
                const rawQuery = `
                  SELECT
                    do_smd_detail_id ,
                    representative_code_list
                  FROM do_smd_detail , unnest(string_to_array(representative_code_list , ','))  s(code)
                  where
                    s.code  = '${escape(resultDataRepresentativeChild[i].representative_code)}' AND
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
                      trip: Number(resultDoSmd.trip) + 1,
                      userIdUpdated: authMeta.userId,
                      updatedTime: timeNow,
                    },
                  );

                  // data.push({
                  //   do_smd_id: resultDoSmd.doSmdId,
                  //   do_smd_code: resultDoSmd.doSmdCode,
                  //   do_smd_detail_id: paramDoSmdDetailId,
                  //   branch_name: resultbranchTo.branchName,
                  //   representative_code_list: payload.representative_code,
                  // });
                  // result.statusCode = HttpStatus.OK;
                  // result.message = 'SMD Route Success Created';
                  // result.data = data;
                  // return result;
                }
              }
            }
            const resultDoSmdDetail = await DoSmdDetail.findOne({
              where: {
                doSmdDetailId:  paramsresultDoSmdDetailId,
                isDeleted: false,
              },
            });
            data.push({
              do_smd_id: resultDoSmd.doSmdId,
              do_smd_code: resultDoSmd.doSmdCode,
              do_smd_detail_id: resultDoSmdDetail.doSmdDetailId,
              branch_name: resultbranchTo.branchName,
              representative_code_list: resultDoSmdDetail.representativeCodeList,
            });
            result.statusCode = HttpStatus.OK;
            result.message = 'SMD Route Success Created';
            result.data = data;
            return result;

          } else {
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
                    trip: Number(resultDoSmd.trip) + 1,
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
    const arrBagItemId = [];
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
          r.representative_code,
          bih.bag_item_status_id
        FROM bag_item bi
        INNER JOIN bagging_item bgi ON bi.bag_item_id = bgi.bag_item_id AND bgi.is_deleted = FALSE
        INNER JOIN bagging bg ON bgi.bagging_id = bg.bagging_id AND bg.is_deleted = FALSE
        INNER JOIN bag b ON bi.bag_id = b.bag_id AND b.is_deleted = FALSE
        LEFT JOIN representative  r on bg.representative_id_to = r.representative_id and r.is_deleted  = FALSE
        LEFT JOIN bag_item_history bih on bih.bag_item_id = bi.bag_item_id and bih.is_deleted  = FALSE
            and bih.bag_item_status_id = 3500
        WHERE
          bg.bagging_id = ${resultBagging.baggingId} AND
          bi.is_deleted = FALSE;
      `;
      const resultDataBagItem = await RawQueryService.query(rawQuery);
      if (resultDataBagItem.length > 0 && resultDataBagItem[0].bag_item_status_id) {
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

              // GET BAG ITEM ID
              arrBagItemId.push(resultDataBagItem[i].bag_item_id);
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
                totalBagging: Number(resultDoSmd.totalBagging) + 1,
                userIdUpdated: authMeta.userId,
                updatedTime: timeNow,
              },
            );

            // Generate history bag and its awb IN_HUB
            BagScanDoSmdQueueService.perform(
              null,
              authMeta.userId,
              permissonPayload.branchId,
              arrBagItemId,
              true,
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
      } else if (resultDataBagItem.length > 0 && !resultDataBagItem[0].bag_item_status_id) {
        throw new BadRequestException(`Bagging Not Scan In Yet`);
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
            r.representative_code,
            bih.bag_item_status_id
          FROM bag_item bi
          INNER JOIN bag b ON b.bag_id = bi.bag_id AND b.is_deleted = FALSE
          LEFT JOIN representative  r on b.representative_id_to = r.representative_id and r.is_deleted  = FALSE
          LEFT JOIN bag_item_history bih on bih.bag_item_id = bi.bag_item_id and bih.is_deleted  = FALSE
            and bih.bag_item_status_id = 3500
          WHERE
            b.bag_number = '${escape(paramBagNumber)}' AND
            bi.bag_seq = '${paramSeq}' AND
            bi.is_deleted = FALSE
          ORDER BY b.created_time DESC;
        `;
        const resultDataBag = await RawQueryService.query(rawQuery);
        if (resultDataBag.length > 0 && resultDataBag[0].bag_item_status_id) {

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
              // arrBagItemId = [resultDataBag[0].bag_item_id];
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
                  totalBag: Number(resultDoSmd.totalBag) + 1,
                  userIdUpdated: authMeta.userId,
                  updatedTime: timeNow,
                },
              );

              await this.createBagItemHistory(Number(resultDataBag[0].bag_item_id), authMeta.userId, permissonPayload.branchId, BAG_STATUS.IN_HUB);

              // Generate history bag and its awb IN_HUB
              BagScanDoSmdQueueService.perform(
                Number(resultDataBag[0].bag_item_id),
                authMeta.userId,
                permissonPayload.branchId,
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
        } else if (resultDataBag.length > 0 && !resultDataBag[0].bag_item_status_id) {
          throw new BadRequestException(`Bag Not Scan In Yet`);
        } else {
          throw new BadRequestException(`Bag Not Found`);
        }
      } else if (payload.item_number.length == 10) {
        const paramBagNumber = payload.item_number.substr( 0 , (payload.item_number.length) - 3 );
        // const paramWeightStr = await payload.item_number.substr(payload.item_number.length - 5);
        const paramBagSeq = await payload.item_number.substr( (payload.item_number.length) - 3 , 3);
        const paramSeq = await paramBagSeq * 1;
        // const weight = parseFloat(paramWeightStr.substr(0, 2) + '.' + paramWeightStr.substr(2, 2));
        rawQuery = `
          SELECT
            bi.bag_item_id,
            b.bag_id,
            b.representative_id_to,
            r.representative_code,
            bih.bag_item_status_id
          FROM bag_item bi
          INNER JOIN bag b ON b.bag_id = bi.bag_id AND b.is_deleted = FALSE
          LEFT JOIN representative  r on b.representative_id_to = r.representative_id and r.is_deleted  = FALSE
          LEFT JOIN bag_item_history bih on bih.bag_item_id = bi.bag_item_id and bih.is_deleted  = FALSE
            and bih.bag_item_status_id = 3500
          WHERE
            b.bag_number = '${escape(paramBagNumber)}' AND
            bi.bag_seq = '${paramSeq}' AND
            bi.is_deleted = FALSE
          ORDER BY b.created_time DESC;
        `;
        const resultDataBag = await RawQueryService.query(rawQuery);
        if (resultDataBag.length > 0 && resultDataBag[0].bag_item_status_id) {

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
              // arrBagItemId = [resultDataBag[0].bag_item_id];
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
                  totalBag: Number(resultDoSmd.totalBag) + 1,
                  userIdUpdated: authMeta.userId,
                  updatedTime: timeNow,
                },
              );

              await this.createBagItemHistory(Number(resultDataBag[0].bag_item_id), authMeta.userId, permissonPayload.branchId, BAG_STATUS.IN_HUB);

              // Generate history bag and its awb IN_HUB
              BagScanDoSmdQueueService.perform(
                Number(resultDataBag[0].bag_item_id),
                authMeta.userId,
                permissonPayload.branchId,
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
        } else if (resultDataBag.length > 0 && !resultDataBag[0].bag_item_status_id) {
          throw new BadRequestException(`Bag Not Scan In Yet`);
        } else {
          throw new BadRequestException(`Bag Not Found`);
        }
      } else {
        throw new BadRequestException(`Bagging / Bag Not Found`);
      }
    }

  }

  static async createBagItemHistory(bagItemId: number, userId: number, branchId: number, bagStatus: number) {
    const resultbagItemHistory = BagItemHistory.create();
    resultbagItemHistory.bagItemId = bagItemId.toString();
    resultbagItemHistory.userId = userId.toString();
    resultbagItemHistory.branchId = branchId.toString();
    resultbagItemHistory.historyDate = moment().toDate();
    resultbagItemHistory.bagItemStatusId = bagStatus.toString();
    resultbagItemHistory.userIdCreated = userId;
    resultbagItemHistory.createdTime = moment().toDate();
    resultbagItemHistory.userIdUpdated = userId;
    resultbagItemHistory.updatedTime = moment().toDate();
    await BagItemHistory.insert(resultbagItemHistory);
  }

  static async scanOutSeal(payload: any): Promise<any> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    const result = new ScanOutSmdSealResponseVm();
    const timeNow = moment().toDate();
    const data = [];
    let rawQuery;

    if (payload.seal_seq == 1) {
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
    } else {
      rawQuery = `
        SELECT
          do_smd_detail_id
        FROM do_smd_detail
        WHERE
          do_smd_id = ${payload.do_smd_id} AND
          arrival_time IS NULL AND
          is_deleted = FALSE
        ;
      `;
    }
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
      result.message = 'SMD Code ' + resultDoSmd.doSmdCode + ' With Seal ' + payload.seal_number + ' Success Created';
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
        BagAwbDeleteHistoryInHubFromSmdQueueService.perform(
          paramdoSmdId,
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
        doSmdStatusIdLast: 8000,
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

        await DoSmd.update(
          { doSmdId :  payload.do_smd_id},
          {
            doSmdStatusIdLast: 1150,
            userIdUpdated: authMeta.userId,
            updatedTime: moment().toDate(),
          },
        );

        await DoSmdDetail.update(
          { doSmdId :  payload.do_smd_id, arrivalTime: null},
          {
            doSmdStatusIdLast: 1150,
            userIdUpdated: authMeta.userId,
            updatedTime: moment().toDate(),
          },
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

  static async scanOutChangeVehicle(payload: any): Promise<any> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    const result = new ScanOutSmdHandoverResponseVm();
    const timeNow = moment().toDate();
    const data = [];
    let paramDoSmdStatus;

    const resultDoSmd = await DoSmd.findOne({
      where: {
        doSmdId: payload.do_smd_id,
        doSmdStatusIdLast: In([1000, 2000]),
        isDeleted: false,
      },
    });
    if (resultDoSmd) {
      const rawQuery = `
        SELECT
          do_smd_vehicle_id,
          vehicle_number,
          employee_id_driver
        FROM do_smd_vehicle
        WHERE
          do_smd_vehicle_id = ${resultDoSmd.doSmdVehicleIdLast} AND
          is_active = TRUE AND
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

        // await DoSmd.update(
        //   { doSmdId : payload.do_smd_id},
        //   {
        //     doSmdVehicleIdLast: paramDoSmdVehicleId,
        //     userIdUpdated: authMeta.userId,
        //     updatedTime: moment().toDate(),
        //   },
        // );
        if (resultDataDoSmdVehicle[0].employee_id_driver == payload.employee_id_driver) {
          paramDoSmdStatus = 1100;
        } else {
          paramDoSmdStatus = 1050;
        }

        await DoSmd.update(
          { doSmdId : payload.do_smd_id},
          {
            doSmdVehicleIdLast: paramDoSmdVehicleId,
            doSmdStatusIdLast: paramDoSmdStatus,
            userIdUpdated: authMeta.userId,
            updatedTime: moment().toDate(),
          },
        );
        const paramDoSmdHistoryId = await this.createDoSmdHistory(
          resultDoSmd.doSmdId,
          null,
          paramDoSmdVehicleId,
          null,
          null,
          resultDoSmd.doSmdTime,
          permissonPayload.branchId,
          paramDoSmdStatus,
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
        if (paramDoSmdStatus == 1100) {
          result.message = 'SMD Code ' + resultDoSmd.doSmdCode + ' Vehicle Success Changed ';
        } else {
          result.message = 'SMD Code ' + resultDoSmd.doSmdCode + ' Driver Success Changed ';
        }

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

  public static async scanOutReassignItem(payload: any) {
    const authMeta = AuthService.getAuthData();
    const timeNow = moment().toDate();
    let totalSuccess = 0;
    let totalError = 0;
    const result = {
      totalData: null,
      totalSuccess: null,
      totalError: null,
      data: [],
    };
    const dataItem = [];
    // const result = new ScanOutSmdRouteResponseVm();

    for (const itemNumber of payload.item_number) {
      if (itemNumber.length == 15 || itemNumber.length == 10) {
        const response = await this.reassignBag(itemNumber, payload.do_smd_id, authMeta.userId, timeNow);
        dataItem.push({
          itemNumber,
          ...response.data,
        });
        totalError += response.total.totalError;
        totalSuccess += response.total.totalSuccess;
      } else if (itemNumber.length == 14) {
        const response = await this.reassignBagging(itemNumber, payload.do_smd_id, authMeta.userId, timeNow);
        dataItem.push({
          itemNumber,
          ...response.data,
        });
        totalError += response.total.totalError;
        totalSuccess += response.total.totalSuccess;
      } else {
        totalError += 1;
        dataItem.push({
          itemNumber,
          status: 'error',
          message: 'Nomor Gabung Paket Tidak Valid',
        });
      }
    }

    // Populate return value
    result.totalData = payload.item_number.length;
    result.totalSuccess = totalSuccess;
    result.totalError = totalError;
    result.data = dataItem;
    return result;
  }

  public static async reassignBag(
    item_number: string,
    do_smd_id: string,
    userId: number,
    time: any,
  ): Promise<any> {
    const paramBagNumber = item_number.substr( 0, 7 );
    const paramWeightStr = item_number.substr(10);
    const paramBagSeq = item_number.substr(7, 3);
    const paramSeq = Number(paramBagSeq);
    let totalError = 0;
    let totalSuccess = 0;
    const response = {
      data: {
        status: 'ok',
        message: 'Assign Ulang Gabung Paket Berhasil',
      },
      total: null,
    };
    // get unassigning do_smd data
    let rawQuery = `
      SELECT
        ds.do_smd_id,
        ds.do_smd_code,
        dsd.do_smd_detail_id,
        dsd.total_bagging,
        dsd.total_bag,
        ds.total_bag as total_bag_header,
        dsdi.do_smd_detail_item_id,
        dsh.do_smd_status_id as status_last,
        r.representative_code,
        dsd.branch_id_to
      FROM do_smd_detail_item dsdi
      INNER JOIN do_smd_detail dsd on dsd.do_smd_detail_id = dsdi.do_smd_detail_id AND dsd.is_deleted  = FALSE
      INNER JOIN bag b ON b.bag_id = dsdi.bag_id AND b.is_deleted = FALSE
      INNER JOIN bag_item bi ON bi.bag_item_id = dsdi.bag_item_id AND bi.is_deleted = FALSE
      INNER JOIN do_smd ds ON ds.do_smd_id = dsd.do_smd_id AND ds.is_deleted = FALSE
      LEFT JOIN do_smd_history dsh ON dsh.do_smd_id = ds.do_smd_id AND dsh.is_deleted = FALSE
      LEFT JOIN representative r ON b.representative_id_to = r.representative_id
      WHERE
        b.bag_number = '${escape(paramBagNumber)}' AND
        bi.bag_seq = '${paramSeq}' AND
        dsdi.is_deleted = FALSE
      ORDER BY case when ds.do_smd_id = '${do_smd_id}' then 1 else 2 end, ds.created_time, dsh.created_time DESC;
    `;
    const unassigningSMD = await RawQueryService.query(rawQuery);

    const codes = await this.getSmdCodeByRequestData(unassigningSMD);
    if (codes.doSmdCode.length > 1) {
      totalError += 1;
      response.data.status = 'error';
      response.data.message = `Gabung Paket ${item_number} Lebih dari 1 Surat Jalan: ${codes.doSmdCode.join(', ')}`;
    } else if (unassigningSMD.length == 0) {
      totalError += 1;
      response.data.status = 'error';
      response.data.message = `Surat jalan dari resi ` + item_number + ` tidak ditemukan`;
    } else if (unassigningSMD[0].status_last >= 3000) {
      totalError += 1;
      response.data.status = 'error';
      response.data.message = `Gabung Paket ` + item_number + ` Sudah Berada di Jalan/Tujuan`;
    } else if (unassigningSMD[0].do_smd_id == do_smd_id) {
      totalError += 1;
      response.data.status = 'error';
      response.data.message = `Gabung Paket ` + item_number + ` Sudah Berada di Surat jalan ` + unassigningSMD[0].do_smd_code;
    } else if (!unassigningSMD[0].representative_code || !unassigningSMD[0].branch_id_to) {
      totalError += 1;
      response.data.status = 'error';
      response.data.message = `Tujuan Gabung Paket ` + item_number + ` tidak ditemukan`;
    } else {
      // get assigning do_smd data
      rawQuery = `
      SELECT
        ds.do_smd_id,
        ds.do_smd_code,
        dsd.do_smd_detail_id,
        dsd.total_bagging,
        dsd.total_bag,
        ds.total_bag as total_bag_header,
        ds.total_bagging as total_bagging_header,
        dsh.do_smd_status_id as status_last
      FROM do_smd ds
      INNER JOIN do_smd_detail dsd ON ds.do_smd_id = dsd.do_smd_id and dsd.is_deleted  = FALSE
      LEFT JOIN do_smd_history dsh ON dsh.do_smd_id = ds.do_smd_id AND dsh.is_deleted = FALSE
      WHERE
        ds.do_smd_id = '${do_smd_id}' AND
        ds.is_deleted = FALSE
      ORDER BY dsh.created_time DESC
      LIMIT 1;
      `;
      const assigningSMD = await RawQueryService.query(rawQuery);

      if (assigningSMD.length == 0) {
        totalError += 1;
        response.data.status = 'error';
        response.data.message = `Surat Jalan yang Akan Di-assign Tidak Ditemukan`;
      } else if (assigningSMD[0].status_last >= 3000) {
        totalError += 1;
        response.data.status = 'error';
        response.data.message = `Gabung Paket dari Surat Jalan ` + assigningSMD[0].do_smd_code + ` Sudah Berada di Jalan`;
      } else {
        // Validasi tujuan gabung paket harus sama dengan surat jalan yang di-assign
        rawQuery = `
        SELECT
          dsd.do_smd_detail_id
        FROM do_smd_detail dsd
        LEFT JOIN do_smd_detail_item dsdi ON dsdi.do_smd_detail_id = dsd.do_smd_detail_id AND dsdi.is_deleted = FALSE
        LEFT JOIN bag b ON b.bag_id = dsdi.bag_id AND b.is_deleted = FALSE
        LEFT JOIN representative r ON b.representative_id_to = r.representative_id AND r.is_deleted = FALSE
        WHERE
          dsd.branch_id_to IN (${codes.branchIdTos.join(',')}) AND
          dsd.do_smd_id = '${do_smd_id}'
        LIMIT 1;
        `;
        const validDestination = await RawQueryService.query(rawQuery);
        if (validDestination.length == 0) {
          totalError += 1;
          response.data.status = 'error';
          response.data.message = `Tujuan Gabung Paket ${item_number} Tidak Cocok Dengan Surat Jalan ${assigningSMD[0].do_smd_code}`;
        } else {

          // Update Bag and SMD/DO_SMD Data
          // increase amount Assign Bag
          await DoSmdDetail.update(
            { doSmdDetailId : assigningSMD[0].do_smd_detail_id },
            {
              totalBag: Number(assigningSMD[0].total_bag) + 1,
              userIdUpdated: userId,
              updatedTime: time,
            },
          );
          await DoSmd.update(
            { doSmdId : assigningSMD[0].do_smd_id },
            {
              totalBag: Number(assigningSMD[0].total_bag_header) + 1,
              userIdUpdated: userId,
              updatedTime: time,
            },
          );

          // decrease amount Unassign Bag
          await DoSmdDetail.update(
            { doSmdDetailId : unassigningSMD[0].do_smd_detail_id },
            {
              totalBag: (unassigningSMD[0].total_bag == 0) ? 0 :
                Number(unassigningSMD[0].total_bag) - 1,
              userIdUpdated: userId,
              updatedTime: time,
            },
          );
          await DoSmd.update(
            { doSmdId : unassigningSMD[0].do_smd_id },
            {
              totalBag: (unassigningSMD[0].total_bag_header == 0) ? 0 :
                Number(unassigningSMD[0].total_bag_header) - 1,
              userIdUpdated: userId,
              updatedTime: time,
            },
          );
          // Reassign do_smd_detail_item to new assigned-smd
          await this.updateDoSmdDetailItem(codes.doSmdDetailItem, validDestination[0].do_smd_detail_id, userId, time);
          totalSuccess += 1;
        }
      }
    }
    response.total = {
      totalSuccess, totalError,
    };
    return response;
  }

  public static async reassignBagging(
    item_number: string,
    do_smd_id: string,
    userId: number,
    time: any,
  ): Promise<any> {
    let totalError = 0;
    let totalSuccess = 0;
    const response = {
      data: {
        status: 'ok',
        message: 'Assign Ulang Bagging Berhasil',
      },
      total: null,
    };
    // get unassigning do_smd data
    let rawQuery = `
      SELECT
        ds.do_smd_id,
        ds.do_smd_code,
        dsd.do_smd_detail_id,
        dsd.total_bagging,
        dsd.total_bag,
        ds.total_bagging as total_bagging_header,
        ds.total_bag as total_bag_header,
        dsdi.do_smd_detail_item_id,
        dsdi.bagging_id,
        dsh.do_smd_status_id as status_last,
        r.representative_code,
        dsd.branch_id_to
      FROM do_smd_detail_item dsdi
      INNER JOIN bagging ba ON ba.bagging_id = dsdi.bagging_id AND ba.is_deleted = FALSE
      INNER JOIN do_smd_detail dsd on dsd.do_smd_detail_id = dsdi.do_smd_detail_id and dsd.is_deleted  = FALSE
      INNER JOIN do_smd ds ON ds.do_smd_id = dsd.do_smd_id AND ds.is_deleted = FALSE
      LEFT JOIN do_smd_history dsh ON dsh.do_smd_id = ds.do_smd_id AND dsh.is_deleted = FALSE
      LEFT JOIN representative r ON ba.representative_id_to = r.representative_id AND r.is_deleted = FALSE
      WHERE
        ba.bagging_code = '${item_number}' AND
        dsdi.is_deleted = FALSE
      ORDER BY case when ds.do_smd_id = '${do_smd_id}' then 1 else 2 end, ds.created_time, dsh.created_time DESC;
    `;
    const unassigningSMD = await RawQueryService.query(rawQuery);
    const codes = await this.getSmdCodeByRequestData(unassigningSMD);

    if (codes.doSmdCode.length > 1) {
      totalError += 1;
      response.data.status = 'error';
      response.data.message = `Bagging ${item_number} Lebih dari 1 Surat Jalan: ${codes.doSmdCode.join(', ')}`;
    } else if (unassigningSMD.length == 0) {
      totalError += 1;
      response.data.status = 'error';
      response.data.message = `Surat jalan dari Bagging ${item_number} Tidak Ditemukan`;
    } else if (unassigningSMD[0].do_smd_id == do_smd_id) {
      totalError += 1;
      response.data.status = 'error';
      response.data.message = `Bagging ` + item_number + ` Sudah Berada di Surat jalan ` + unassigningSMD[0].do_smd_code;
    } else if (unassigningSMD[0].status_last >= 3000) {
      totalError += 1;
      response.data.status = 'error';
      response.data.message = `Bagging ` + item_number + ` Sudah Berada di Jalan/Tujuan`;
    } else if (!unassigningSMD[0].representative_code || !unassigningSMD[0].branch_id_to) {
      totalError += 1;
      response.data.status = 'error';
      response.data.message = `Tujuan Bagging ` + item_number + ` tidak ditemukan`;
    } else {
      rawQuery = `
        SELECT
          ba.bagging_id
        FROM bagging ba
        WHERE
          ba.bagging_code = '${item_number}' AND
          ba.is_deleted = FALSE
        LIMIT 1;
      `;
      const bagging = await RawQueryService.query(rawQuery);
      if (bagging.length == 0) {
        totalError += 1;
        response.data.status = 'error';
        response.data.message = `Bagging ` + item_number + ` Tidak Ditemukan`;
      } else {
        // get assigning do_smd data
        rawQuery = `
        SELECT
          ds.do_smd_id,
          ds.do_smd_code,
          dsd.do_smd_detail_id,
          dsd.total_bagging,
          dsd.total_bag,
          ds.total_bag as total_bag_header,
          ds.total_bagging as total_bagging_header,
          dsh.do_smd_status_id as status_last
        FROM do_smd ds
        INNER JOIN do_smd_detail dsd ON ds.do_smd_id = dsd.do_smd_id and dsd.is_deleted  = FALSE
        LEFT JOIN do_smd_history dsh ON dsh.do_smd_id = ds.do_smd_id AND dsh.is_deleted = FALSE
        WHERE
          ds.do_smd_id = '${do_smd_id}' AND
          ds.is_deleted = FALSE
        ORDER BY dsh.created_time DESC
        LIMIT 1;
        `;
        const assigningSMD = await RawQueryService.query(rawQuery);

        // Validasi tujuan Bagging harus sama dengan surat jalan yang di-assign
        rawQuery = `
          SELECT
            dsd.do_smd_detail_id
          FROM do_smd_detail dsd
          LEFT JOIN do_smd_detail_item dsdi ON dsdi.do_smd_detail_id = dsd.do_smd_detail_id AND dsdi.is_deleted = FALSE
          LEFT JOIN bagging ba ON ba.bagging_id = dsdi.bagging_id AND ba.is_deleted = FALSE
          LEFT JOIN representative r ON ba.representative_id_to = r.representative_id AND r.is_deleted = FALSE
          WHERE
            dsd.branch_id_to IN (${codes.branchIdTos.join(',')}) AND
            dsd.do_smd_id = '${do_smd_id}'
          LIMIT 1;
        `;
        const validDestination = await RawQueryService.query(rawQuery);
        if (assigningSMD.length == 0) {
          totalError += 1;
          response.data.status = 'error';
          response.data.message = `Surat Jalan yang Akan Di-assign Tidak Ditemukan`;
        } else if (assigningSMD[0].status_last >= 3000) {
          totalError += 1;
          response.data.status = 'error';
          response.data.message = `Bagging dari Surat Jalan ` + assigningSMD[0].do_smd_code + ` Sudah Berada di Jalan/Tujuan`;
        } else if (validDestination.length == 0) {
          totalError += 1;
          response.data.status = 'error';
          response.data.message = `Tujuan Bagging ${item_number} Tidak Cocok Dengan Surat Jalan ${assigningSMD[0].do_smd_code}`;
        } else {
          // Update Bagging and SMD/DO_SMD Data
          // increase amount Assign Bagging
          await DoSmdDetail.update(
            { doSmdDetailId : assigningSMD[0].do_smd_detail_id },
            {
              totalBagging: Number(assigningSMD[0].total_bagging) + 1,
              userIdUpdated: userId,
              updatedTime: time,
            },
          );
          await DoSmd.update(
            { doSmdId : assigningSMD[0].do_smd_id },
            {
              totalBagging: Number(assigningSMD[0].total_bagging_header) + 1,
              userIdUpdated: userId,
              updatedTime: time,
            },
          );

          // decrease amount Unassign Bagging
          // decrease amount SMD of bagging and its combine package
          for (const item of unassigningSMD) {
            await DoSmdDetail.update(
              { doSmdDetailId : item.do_smd_detail_id },
              {
                totalBagging: (item.total_bagging == 0) ? 0 :
                  (Number(item.total_bagging) - 1),
                userIdUpdated: userId,
                updatedTime: time,
              },
            );
            await DoSmd.update(
              { doSmdId : item.do_smd_id },
              {
                totalBagging: (item.total_bagging_header == 0) ? 0 :
                  Number(item.total_bagging_header) - 1,
                userIdUpdated: userId,
                updatedTime: time,
              },
            );
          }
          // Reassign do_smd_detail_item to new assigned-smd
          await this.updateDoSmdDetailItem(codes.doSmdDetailItem, validDestination[0].do_smd_detail_id, userId, time);
          totalSuccess += 1;
        }
      }
    }
    response.total = {
      totalSuccess, totalError,
    };
    return response;
  }

  static async getSmdCodeByRequestData(data: any): Promise<any> {
    const arrSmdCode = [];
    const arrSmdItem = [];
    const arrBranchIdTo = [];
    for (const item of data) {
      arrSmdItem.push(item.do_smd_detail_item_id);
      arrBranchIdTo.push(item.branch_id_to);
      if (arrSmdCode.includes(item.do_smd_code)) {
        continue;
      }
      arrSmdCode.push(item.do_smd_code);
    }
    return {
      doSmdCode: arrSmdCode,
      doSmdDetailItem: arrSmdItem,
      branchIdTos: arrBranchIdTo,
    };
  }

  static async updateDoSmdDetailItem(id: any, updatedId, userId, time) {
    // Reassign do_smd_detail_item to new assigned-smd
    await DoSmdDetailItem.update(
      { doSmdDetailItemId : In(id) },
      {
        doSmdDetailId: updatedId,
        userIdUpdated: userId,
        updatedTime: time,
      },
    );
  }
}
