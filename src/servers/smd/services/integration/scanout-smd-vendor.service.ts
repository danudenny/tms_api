import { Injectable } from '@nestjs/common';
import moment = require('moment');
import { BadRequestException } from '@nestjs/common';
import { RawQueryService } from '../../../../shared/services/raw-query.service';
import { ScanOutSmdRouteResponseVm } from '../../models/scanout-smd.response.vm';
import { HttpStatus } from '@nestjs/common';
import { CustomCounterCode } from '../../../../shared/services/custom-counter-code.service';
import { AuthService } from '../../../../shared/services/auth.service';
import { Branch } from '../../../../shared/orm-entity/branch';
import { Representative } from '../../../../shared/orm-entity/representative';
import { Bagging } from '../../../../shared/orm-entity/bagging';
import { DoSmd } from '../../../../shared/orm-entity/do_smd';
import { DoSmdDetail } from '../../../../shared/orm-entity/do_smd_detail';
import { DoSmdDetailItem } from '../../../../shared/orm-entity/do_smd_detail_item';
import { DoSmdVehicle } from '../../../../shared/orm-entity/do_smd_vehicle';
import { DoSmdHistory } from '../../../../shared/orm-entity/do_smd_history';
import { BagItemHistory } from '../../../../shared/orm-entity/bag-item-history';
import { ScanOutSmdVendorRouteResponseVm, ScanOutSmdVendorEndResponseVm, ScanOutSmdVendorItemResponseVm, ScanOutSmdVendorItemMoreResponseVm, ScanOutVendorItemMoreDataVm } from '../../models/scanout-smd-vendor.response.vm';
import { BagRepresentativeScanOutHubQueueService } from '../../../queue/services/bag-representative-scan-out-hub-queue.service';
import { BagScanVendorQueueService } from '../../../queue/services/bag-scan-vendor-queue.service';
import { BagAwbDeleteHistoryInHubFromSmdQueueService } from '../../../queue/services/bag-awb-delete-history-in-hub-from-smd-queue.service';
import { RedisService } from '../../../../shared/services/redis.service';
import { ScanOutSmdVendorItemMorePayloadVm, ScanOutSmdVendorItemPayloadVm } from '../../models/scanout-smd-vendor.payload.vm';

@Injectable()
export class ScanoutSmdVendorService {
  static async scanOutVendorRoute(payload: any): Promise<any> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    const result = new ScanOutSmdVendorRouteResponseVm();
    const timeNow = moment().toDate();
    const data = [];
    let paramDoSmdId;
    let paramsresultDoSmdDetailId;
    paramDoSmdId = payload.do_smd_id;

    if (!paramDoSmdId) {
      // Insert New Darat MP
      // let paramDoSmdCode = await CustomCounterCode.doSmdCodeCounter(timeNow);
      const paramDoSmdCode = await CustomCounterCode.doSmdCodeRandomCounter(timeNow);

      const redlock = await RedisService.redlock(`redlock:doSmdVendor:${paramDoSmdCode}`, 10);
      if (!redlock) {
        throw new BadRequestException(`Data Darat MP Sedang di proses, Silahkan Coba Beberapa Saat`);
      }

      paramDoSmdId = await this.createDoSmd(
        paramDoSmdCode,
        timeNow,
        permissonPayload.branchId,
        authMeta.userId,
        1,
        payload.vendor_id,
        payload.vendor_name,
      );

      const paramDoSmdHistoryId = await this.createDoSmdHistory(
        paramDoSmdId,
        null,
        null,
        null,
        null,
        timeNow,
        permissonPayload.branchId,
        1000,
        null,
        null,
        authMeta.userId,
      );
    }

    const resultDoSmd = await DoSmd.findOne({
      where: {
        doSmdId: paramDoSmdId,
        isDeleted: false,
      },
    });
    if (resultDoSmd) {
      // Cek Representative code
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
                doSmdId: paramDoSmdId,
                isDeleted: false,
              },
            });
            if (resultDoSmdDetail) {
                // Update Detail
                paramsresultDoSmdDetailId = resultDoSmdDetail.doSmdDetailId;
                const rawQuery = `
                SELECT
                  do_smd_detail_id ,
                  representative_code_list
                FROM do_smd_detail , unnest(string_to_array(representative_code_list , ','))  s(code)
                where
                  s.code  = '${escape(resultDataRepresentativeChild[i].representative_code)}' AND
                  do_smd_id = ${paramDoSmdId} AND
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

              }
            } else {
              // Insert Detail
              const rawQuery = `
                SELECT
                  do_smd_detail_id ,
                  representative_code_list
                FROM do_smd_detail , unnest(string_to_array(representative_code_list , ','))  s(code)
                where
                  s.code  = '${escape(resultDataRepresentativeChild[i].representative_code)}' AND
                  do_smd_id = ${paramDoSmdId} AND
                  is_deleted = FALSE;
              `;
              const resultDataRepresentative = await RawQueryService.query(rawQuery);

              if (resultDataRepresentative.length > 0) {
                throw new BadRequestException(`Representative Code already scan !!`);
              } else {
                const paramDoSmdDetailId = await this.createDoSmdDetail(
                  paramDoSmdId,
                  null,
                  payload.representative_code,
                  resultDoSmd.doSmdTime,
                  permissonPayload.branchId,
                  null,
                  authMeta.userId,
                  payload.vendor_id,
                  payload.vendor_name,
                );

                await DoSmd.update(
                  { doSmdId : resultDoSmd.doSmdId },
                  {
                    doSmdDetailIdLast: paramDoSmdDetailId,
                    totalDetail: resultDoSmd.totalDetail + 1,
                    trip: Number(resultDoSmd.trip) + 1,
                    userIdUpdated: authMeta.userId,
                    updatedTime: timeNow,
                  },
                );
              }
            }
          }
          const resultDoSmdDetail = await DoSmdDetail.findOne({
            where: {
              doSmdId: paramDoSmdId,
              isDeleted: false,
            },
          });
          data.push({
            do_smd_id: resultDoSmd.doSmdId,
            do_smd_code: resultDoSmd.doSmdCode,
            do_smd_detail_id: resultDoSmdDetail.doSmdDetailId,
            vendor_name: payload.vendor_name,
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
                do_smd_id = ${paramDoSmdId} AND
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
                vendor_name: payload.vendor_name,
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
                do_smd_id = ${paramDoSmdId} AND
                is_deleted = FALSE;
            `;
            const resultDataRepresentative = await RawQueryService.query(rawQuery);

            if (resultDataRepresentative.length > 0) {
              throw new BadRequestException(`Representative Code already scan !!`);
            } else {
              const paramDoSmdDetailId = await this.createDoSmdDetail(
                resultDoSmd.doSmdId,
                null,
                payload.representative_code,
                resultDoSmd.doSmdTime,
                permissonPayload.branchId,
                null,
                authMeta.userId,
                payload.vendor_id,
                payload.vendor_name,
              );

              await DoSmd.update(
                { doSmdId : resultDoSmd.doSmdId },
                {
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
                vendor_name: payload.vendor_name,
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
      throw new BadRequestException(`Can't Find Do SMD ID :` + paramDoSmdId);
    }

  }

  static async scanOutRoutea(payload: any): Promise<any> {
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
                    payload.vendor_id,
                    payload.vendor_name,
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
                  payload.vendor_id,
                  payload.vendor_name,
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

  static async scanOutVendorItem(payload: any): Promise<any> {
    // Bag Type 0 = Bagging, 1 =  Bag / Gab.Paket, 2 = Bag Representative / Gabung Sortir Kota
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    const result = new ScanOutSmdVendorItemResponseVm();
    const timeNow = moment().toDate();
    const arrBagItemId = [];
    const data = [];
    let rawQuery;
    result.statusCode = HttpStatus.BAD_REQUEST;

    const resultBagging = await Bagging.findOne({
      where: {
        baggingCode: payload.item_number,
        isDeleted: false,
      },
    });

    rawQuery = `
        SELECT
          br.bag_representative_id,
          br.bag_representative_code,
          r.representative_code,
          br.representative_id_to,
          br.bag_representative_date,
          br.total_item,
          br.total_weight
        FROM bag_representative br
        INNER JOIN representative  r on br.representative_id_to = r.representative_id and r.is_deleted  = FALSE
        WHERE
          br.bag_representative_code = '${payload.item_number}' AND
          br.is_deleted = FALSE;
      `;
    const resultDataBagRepresentative = await RawQueryService.query(rawQuery);

    const resultDoSmd = await DoSmd.findOne({
      where: {
        doSmdId: payload.do_smd_id,
        isDeleted: false,
      },
    });

    if (resultDataBagRepresentative.length > 0) {
      rawQuery = `
          SELECT
            do_smd_detail_id ,
            representative_code_list,
            total_bag_representative,
            vendor_name
          FROM do_smd_detail, unnest(string_to_array(representative_code_list , ','))  s(code)
          where
            s.code  = '${escape(resultDataBagRepresentative[0].representative_code)}' AND
            do_smd_id = ${payload.do_smd_id} AND
            is_deleted = FALSE;
        `;
      const resultDataRepresentative = await RawQueryService.query(rawQuery);
      if (resultDataRepresentative.length > 0) {
        const resultDoSmdDetailItem = await DoSmdDetailItem.findOne({
          where: {
            doSmdDetailId: resultDataRepresentative[0].do_smd_detail_id,
            bagRepresentativeId: resultDataBagRepresentative[0].bag_representative_id,
            isDeleted: false,
          },
        });
        if (resultDoSmdDetailItem) {
          result.message = 'Bag Representative Already Scanned';
          return result;
        } else {
          await this.createDoSmdDetailItem(
            resultDataRepresentative[0].do_smd_detail_id,
            permissonPayload.branchId,
            null,
            null,
            null,
            resultDataBagRepresentative[0].bag_representative_id,
            2,
            authMeta.userId,
          );
          const resultDoSmdDetail = await DoSmdDetail.findOne({
            where: {
              doSmdDetailId: resultDataRepresentative[0].do_smd_detail_id,
              isDeleted: false,
            },
          });
          resultDoSmdDetail.totalBagRepresentative = Number(resultDoSmdDetail.totalBagRepresentative) + 1;
          resultDoSmdDetail.userIdUpdated = authMeta.userId;
          resultDoSmdDetail.updatedTime = timeNow;
          await resultDoSmdDetail.save();

          await DoSmd.update(
            { doSmdId : payload.do_smd_id },
            {
              totalBagRepresentative: Number(resultDoSmd.totalBagRepresentative) + 1,
              totalItem: Number(resultDoSmd.totalItem) + 1,
              userIdUpdated: authMeta.userId,
              updatedTime: timeNow,
            },
          );
          BagRepresentativeScanOutHubQueueService.perform(
            resultDataBagRepresentative[0].bag_representative_id,
            resultDataBagRepresentative[0].representative_id_to,
            resultDataBagRepresentative[0].bag_representative_code,
            resultDataBagRepresentative[0].bag_representative_date,
            resultDataBagRepresentative[0].total_item,
            resultDataBagRepresentative[0].total_weight,
            authMeta.userId,
            permissonPayload.branchId,
            resultDataRepresentative[0].vendor_name,
          );

          data.push({
            do_smd_detail_id: resultDataRepresentative[0].do_smd_detail_id,
            bagging_id: null,
            bag_id: null,
            bag_item_id: null,
            bag_representative_id: resultDataBagRepresentative[0].bag_representative_id,
            bag_type: 2,
            bag_number: null,
            bagging_number: null,
            bag_representative_code: payload.item_number,
            total_bag: resultDoSmdDetail.totalBag,
            total_bagging: resultDoSmdDetail.totalBagging,
            total_bag_representative: resultDoSmdDetail.totalBagRepresentative,
          });
          result.statusCode = HttpStatus.OK;
          result.message = 'SMD Item Success Created';
          result.data = data;
          return result;
        }
      } else {
        result.message = 'Representative To Bag Representative Not Match';
        return result;
      }
    } else if (resultBagging) {
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
            total_bagging,
            vendor_name
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
            result.message = 'Bagging Already Scanned';
            return result;
          } else {
            for (let i = 0; i < resultDataBagItem.length; i++) {
              // Insert Do SMD DETAIL ITEM & Update DO SMD DETAIL TOT BAGGING
              // customer.awbStatusName = data[i].awbStatusName;
              //  BAG TYPE 0 = Bagging, 1 = Bag / Gab. Paket, 2 = Bag Representative / Gabung Sortir Kota
              const paramDoSmdDetailItemId = await this.createDoSmdDetailItem(
                resultDataRepresentative[0].do_smd_detail_id,
                permissonPayload.branchId,
                resultDataBagItem[i].bag_item_id,
                resultDataBagItem[i].bag_id,
                resultDataBagItem[i].bagging_id,
                null,
                0,
                authMeta.userId,
              );

              // GET BAG ITEM ID
              arrBagItemId.push(resultDataBagItem[i].bag_item_id);
            }

            const resultDoSmdDetail = await DoSmdDetail.findOne({
              where: {
                doSmdDetailId: resultDataRepresentative[0].do_smd_detail_id,
                isDeleted: false,
              },
            });
            resultDoSmdDetail.totalBagging = Number(resultDoSmdDetail.totalBagging) + 1;
            resultDoSmdDetail.userIdUpdated = authMeta.userId;
            resultDoSmdDetail.updatedTime = timeNow;
            await resultDoSmdDetail.save();

            await DoSmd.update(
              { doSmdId : payload.do_smd_id },
              {
                totalBagging: Number(resultDoSmd.totalBagging) + 1,
                totalItem: Number(resultDoSmd.totalItem) + 1,
                userIdUpdated: authMeta.userId,
                updatedTime: timeNow,
              },
            );

            // Generate history bag and its awb IN_HUB
            BagScanVendorQueueService.perform(
              null,
              authMeta.userId,
              permissonPayload.branchId,
              arrBagItemId,
              true,
              resultDataRepresentative[0].vendor_name,
            );

            data.push({
              do_smd_detail_id: resultDataRepresentative[0].do_smd_detail_id,
              bagging_id: resultDataBagItem[0].bagging_id,
              bag_id: null,
              bag_item_id: null,
              bag_representative_id: null,
              bag_type: 0,
              bag_number: null,
              bagging_number: payload.item_number,
              bag_representative_code: null,
              total_bag: resultDoSmdDetail.totalBag,
              total_bagging: resultDoSmdDetail.totalBagging,
              total_bag_representative: resultDoSmdDetail.totalBagRepresentative,
            });
            result.statusCode = HttpStatus.OK;
            result.message = 'SMD Item Success Created';
            result.data = data;
            return result;
          }
        } else {
          result.message = 'Representative To Bagging Not Match';
          return result;
        }
      } else if (resultDataBagItem.length > 0 && !resultDataBagItem[0].bag_item_status_id) {
        result.message = 'Bagging Not Scan In Yet';
        return result;
      } else {
        result.message = 'Bagging Item Not Found';
        return result;
      }
    } else {
      // cari di bag code
      if (payload.item_number.length == 15 && payload.item_number.match(/^[A-Z0-9]{7}[0-9]{8}$/)) {
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
              dsd.do_smd_detail_id ,
              dsd.representative_code_list,
              dsd.total_bag,
              dsd.vendor_name,
              dsdi.bag_item_id
            FROM do_smd_detail dsd
            LEFT JOIN do_smd_detail_item dsdi ON dsdi.do_smd_detail_id = dsd.do_smd_detail_id AND dsdi.is_deleted = FALSE
              AND dsdi.bag_item_id = ${resultDataBag[0].bag_item_id}
            , unnest(string_to_array(dsd.representative_code_list , ','))  s(code)
            where
              s.code  = '${escape(resultDataBag[0].representative_code)}' AND
              dsd.do_smd_id = ${payload.do_smd_id} AND
              dsd.is_deleted = FALSE;
          `;
          const resultDataRepresentative = await RawQueryService.query(rawQuery);

          if (resultDataRepresentative.length > 0 && !resultDataRepresentative[0].bag_item_id) {
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
                null,
                1,
                authMeta.userId,
              );
              // arrBagItemId = [resultDataBag[0].bag_item_id];
            // }

              const resultDoSmdDetail = await DoSmdDetail.findOne({
                where: {
                  doSmdDetailId: resultDataRepresentative[0].do_smd_detail_id,
                  isDeleted: false,
                },
              });
              resultDoSmdDetail.totalBag = Number(resultDoSmdDetail.totalBag) + 1;
              resultDoSmdDetail.userIdUpdated = authMeta.userId;
              resultDoSmdDetail.updatedTime = timeNow;
              await resultDoSmdDetail.save();

              await DoSmd.update(
                { doSmdId : payload.do_smd_id },
                {
                  totalBag: Number(resultDoSmd.totalBag) + 1,
                  totalItem: Number(resultDoSmd.totalItem) + 1,
                  userIdUpdated: authMeta.userId,
                  updatedTime: timeNow,
                },
              );

              // await this.createBagItemHistory(Number(resultDataBag[0].bag_item_id), authMeta.userId, permissonPayload.branchId, BAG_STATUS.IN_HUB);

              // Generate history bag and its awb IN_HUB
              BagScanVendorQueueService.perform(
                Number(resultDataBag[0].bag_item_id),
                authMeta.userId,
                permissonPayload.branchId,
                null,
                true,
                resultDataRepresentative[0].vendor_name,
              );

              data.push({
                do_smd_detail_id: resultDataRepresentative[0].do_smd_detail_id,
                bagging_id: null,
                bag_id: resultDataBag[0].bag_id,
                bag_item_id: resultDataBag[0].bag_item_id,
                bag_representative_id: null,
                bag_type: 1,
                bag_number: payload.item_number,
                bagging_number: null,
                bag_representative_code: null,
                total_bag: resultDoSmdDetail.totalBag,
                total_bagging: resultDoSmdDetail.totalBagging,
                total_bag_representative: resultDoSmdDetail.totalBagRepresentative,
              });
              result.statusCode = HttpStatus.OK;
              result.message = 'SMD Item Success Created';
              result.data = data;
              return result;
          } else if (resultDataRepresentative.length > 0 && resultDataRepresentative[0].bag_item_id) {
            result.message = `Combine Package ` + payload.item_number + ` Already Scanned`;
            return result;
          } else {
            result.message = `Representative To ` + resultDataBag[0].representative_code + ` Bag 15 Not Match`;
            return result;
          }
        } else if (resultDataBag.length > 0 && !resultDataBag[0].bag_item_status_id) {
          result.message = 'Bag Not Scan In Yet';
          return result;
        } else {
          result.message = 'Bag Not Found';
          return result;
        }
      } else if (payload.item_number.length == 10 && payload.item_number.match(/^[A-Z0-9]{7}[0-9]{3}$/)) {
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
              dsd.do_smd_detail_id ,
              dsd.representative_code_list,
              dsd.total_bag,
              dsd.vendor_name,
              dsdi.bag_item_id
            FROM do_smd_detail dsd
            LEFT JOIN do_smd_detail_item dsdi ON dsdi.do_smd_detail_id = dsd.do_smd_detail_id AND dsdi.is_deleted = FALSE
              AND dsdi.bag_item_id = ${resultDataBag[0].bag_item_id}
            , unnest(string_to_array(dsd.representative_code_list , ','))  s(code)
            where
              s.code  = '${escape(resultDataBag[0].representative_code)}' AND
              dsd.do_smd_id = ${payload.do_smd_id} AND
              dsd.is_deleted = FALSE;
          `;
          const resultDataRepresentative = await RawQueryService.query(rawQuery);

          if (resultDataRepresentative.length > 0 && !resultDataRepresentative[0].bag_item_id) {
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
                null,
                1,
                authMeta.userId,
              );
              // arrBagItemId = [resultDataBag[0].bag_item_id];
            // }

              const resultDoSmdDetail = await DoSmdDetail.findOne({
                where: {
                  doSmdDetailId: resultDataRepresentative[0].do_smd_detail_id,
                  isDeleted: false,
                },
              });
              resultDoSmdDetail.totalBag = Number(resultDoSmdDetail.totalBag) + 1;
              resultDoSmdDetail.userIdUpdated = authMeta.userId;
              resultDoSmdDetail.updatedTime = timeNow;
              await resultDoSmdDetail.save();

              await DoSmd.update(
                { doSmdId : payload.do_smd_id },
                {
                  totalBag: Number(resultDoSmd.totalBag) + 1,
                  totalItem: Number(resultDoSmd.totalItem) + 1,
                  userIdUpdated: authMeta.userId,
                  updatedTime: timeNow,
                },
              );

              // await this.createBagItemHistory(Number(resultDataBag[0].bag_item_id), authMeta.userId, permissonPayload.branchId, BAG_STATUS.IN_HUB);

              // Generate history bag and its awb IN_HUB
              BagScanVendorQueueService.perform(
                Number(resultDataBag[0].bag_item_id),
                authMeta.userId,
                permissonPayload.branchId,
                null,
                true,
                resultDataRepresentative[0].vendor_name,
              );

              data.push({
                do_smd_detail_id: resultDataRepresentative[0].do_smd_detail_id,
                bagging_id: null,
                bag_id: resultDataBag[0].bag_id,
                bag_item_id: resultDataBag[0].bag_item_id,
                bag_representative_id: null,
                bag_type: 1,
                bag_number: payload.item_number,
                bagging_number: null,
                bag_representative_code: null,
                total_bag: resultDoSmdDetail.totalBag,
                total_bagging: resultDoSmdDetail.totalBagging,
                total_bag_representative: resultDoSmdDetail.totalBagRepresentative,
              });
              result.statusCode = HttpStatus.OK;
              result.message = 'SMD Item Success Created';
              result.data = data;
              return result;
          } else if (resultDataRepresentative.length > 0 && resultDataRepresentative[0].bag_item_id) {
            result.message = `Combine Package ` + payload.item_number + ` Already Scanned`;
            return result;
          } else {
            result.message = `Representative To ` + resultDataBag[0].representative_code + `  Bag 10 Not Match`;
            return result;
          }
        } else if (resultDataBag.length > 0 && !resultDataBag[0].bag_item_status_id) {
          result.message = 'Bag 10 Not Scan In Yet';
          return result;
        } else {
          result.message = 'Bag 10 Not Found';
          return result;
        }
      } else {
        result.message = 'Bagging / Bag Not Found';
        return result;
      }
    }
  }

  static async scanOutVendorItemMore(payload: ScanOutSmdVendorItemMorePayloadVm)
  : Promise<ScanOutSmdVendorItemMoreResponseVm> {
    const result = new ScanOutSmdVendorItemMoreResponseVm();
    const p = new ScanOutSmdVendorItemPayloadVm();
    let totalError = 0;
    let totalSuccess = 0;
    const uniqueNumber = [];

    result.data = [];
    p.do_smd_id = payload.do_smd_id;

    if (typeof(payload.item_number) != 'object') {
      payload.item_number = [payload.item_number];
    }

    // TODO:
    // 1. get response scanOutVendorItem of each item_number
    // 2. populate total
    for (const itemNumber of payload.item_number) {
      p.item_number = itemNumber;

      // handle duplikat
      let number = itemNumber;
      let messageDuplicate = '';
      if ((itemNumber.substring(0, 3) != 'GSK' && itemNumber.substring(0, 3) != 'BGX') && (itemNumber.length == 10 || itemNumber.length == 15)) {
        number = itemNumber.substring(0, 10);
        if (uniqueNumber.includes(number)) {
          messageDuplicate = `Scan gabung paket ${itemNumber} duplikat!`;
        }
      } else {
        number = itemNumber;
        if (uniqueNumber.includes(number)) {
          messageDuplicate = `Scan ${itemNumber} duplikat!`;
        }
      }

      if (messageDuplicate) {
        result.data.push({
          statusCode: 400,
          message: messageDuplicate,
          item_number: itemNumber,
        } as ScanOutVendorItemMoreDataVm);
        continue;
      }
      uniqueNumber.push(number);

      const res = await this.scanOutVendorItem(p) as ScanOutSmdVendorItemResponseVm;
      result.data.push({
        ...res,
        item_number: itemNumber,
      });

      if (res.statusCode == HttpStatus.OK) {
        totalSuccess++;
      } else {
        totalError++;
      }
    }
    result.totalData = payload.item_number.length;
    result.totalSuccess = totalSuccess;
    result.totalError = totalError;
    return result;
  }

  static async scanOutVendorEnd(payload: any): Promise<any> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    const result = new ScanOutSmdVendorEndResponseVm();
    const timeNow = moment().toDate();
    const data = [];

    const resultDoSmd = await DoSmd.findOne({
      where: {
        doSmdId: payload.do_smd_id,
        isDeleted: false,
      },
    });
    if (resultDoSmd) {
      const paramDoSmdHistoryId = await this.createDoSmdHistory(
        resultDoSmd.doSmdId,
        null,
        resultDoSmd.doSmdVehicleIdLast,
        null,
        null,
        resultDoSmd.doSmdTime,
        permissonPayload.branchId,
        2050,
        payload.seal_number,
        null,
        authMeta.userId,
      );
      data.push({
        do_smd_id: resultDoSmd.doSmdId,
        do_smd_code: resultDoSmd.doSmdCode,
        vendor_name: resultDoSmd.vendorName,
      });
      result.statusCode = HttpStatus.OK;
      result.message = 'SMD Code ' + resultDoSmd.doSmdCode + ' With Vendor ( ' + resultDoSmd.vendorName + ' ) Success Created';
      result.data = data;
      return result;
    } else {
      throw new BadRequestException(`Can't Find  DO SMD ID : ` + payload.do_smd_id.toString());
    }

  }

  public static async deleteSmdVendor(paramdoSmdId: number) {
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

  private static async createDoSmd(
    paramDoSmdCode: string,
    paramDoSmdTime: Date,
    paramBranchId: number,
    userId: number,
    paramCounterTrip: number,
    paramVendorId: number,
    paramVendorName: string,
  ) {
    const dataDoSmd = DoSmd.create({
      doSmdCode: paramDoSmdCode,
      doSmdTime: paramDoSmdTime,
      userId,
      branchId: paramBranchId,
      totalVehicle: 0,
      departureScheduleDateTime: paramDoSmdTime,
      counterTrip: paramCounterTrip,
      vendorId: paramVendorId,
      vendorName: paramVendorName,
      isVendor: true,
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
    paramVendorId: number,
    paramVendorName: string,
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
      vendorId: paramVendorId,
      vendorName: paramVendorName,
      isVendor: true,
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
    paramBagRepresetativeId: number,
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
      bagRepresentativeId: paramBagRepresetativeId,
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
