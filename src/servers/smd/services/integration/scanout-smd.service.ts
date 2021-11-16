import { Injectable } from '@nestjs/common';
import moment = require('moment');
import { BadRequestException } from '@nestjs/common';
import { RawQueryService } from '../../../../shared/services/raw-query.service';
import { ScanOutSmdVehicleResponseVm, ScanOutSmdRouteResponseVm, ScanOutSmdItemResponseVm, ScanOutSmdSealResponseVm, ScanOutSmdHandoverResponseVm, ScanOutSmdItemMoreResponseVm, ScanOutSmdEditResponseVm, ScanOutSmdEditDetailResponseVm, ScanOutSmdItemMoreDataResponseVm, ScanOutSmdEmptyVehicleResponseVm } from '../../models/scanout-smd.response.vm';
import { HttpStatus } from '@nestjs/common';
import { CustomCounterCode } from '../../../../shared/services/custom-counter-code.service';
import { AuthService } from '../../../../shared/services/auth.service';
import { Branch } from '../../../../shared/orm-entity/branch';
import { Representative } from '../../../../shared/orm-entity/representative';
import { Bagging } from '../../../../shared/orm-entity/bagging';
import { IsNull, In, Not, getManager } from 'typeorm';
import { DoSmd } from '../../../../shared/orm-entity/do_smd';
import { DoSmdDetail } from '../../../../shared/orm-entity/do_smd_detail';
import { DoSmdDetailItem } from '../../../../shared/orm-entity/do_smd_detail_item';
import { BagScanDoSmdQueueService } from '../../../queue/services/bag-scan-do-smd-queue.service';
import { DoSmdVehicle } from '../../../../shared/orm-entity/do_smd_vehicle';
import { DoSmdHistory } from '../../../../shared/orm-entity/do_smd_history';
import { BAG_STATUS } from '../../../../shared/constants/bag-status.constant';
import { BagItemHistory } from '../../../../shared/orm-entity/bag-item-history';
import { BagAwbDeleteHistoryInHubFromSmdQueueService } from '../../../queue/services/bag-awb-delete-history-in-hub-from-smd-queue.service';
import { BagRepresentative } from '../../../../shared/orm-entity/bag-representative';
import { BagRepresentativeScanDoSmdQueueService } from '../../../queue/services/bag-representative-scan-do-smd-queue.service';
import { RedisService } from '../../../../shared/services/redis.service';
import { ScanOutSmdItemMorePayloadVm, ScanOutSmdItemPayloadVm, ScanOutSmdEmptyVehiclePayloadVm, SealChangeManualPayloadVm } from '../../models/scanout-smd.payload.vm';
import { toInteger } from 'lodash';
import { BagItem } from '../../../../shared/orm-entity/bag-item';
import { RequestErrorService } from '../../../../shared/services/request-error.service';

@Injectable()
export class ScanoutSmdService {
  static async scanOutVehicle(payload: any): Promise<any> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    const result = new ScanOutSmdVehicleResponseVm();
    const timeNow = moment().toDate();
    // let  paramDoSmdCode = await CustomCounterCode.doSmdCodeCounter(timeNow);

    const rawQueryDriver = `
      SELECT
        dsv.employee_id_driver,
        ds.do_smd_status_id_last,
        ds.do_smd_id,
        ds.branch_id
      FROM do_smd_vehicle dsv
      INNER JOIN do_smd ds ON dsv.do_smd_vehicle_id = ds.vehicle_id_last AND ds.is_empty = FALSE AND ds.do_smd_status_id_last <> 6000 AND ds.is_deleted = FALSE
      WHERE
        dsv.created_time >= '${moment().subtract(30,'days').format('YYYY-MM-DD 00:00:00')}' AND 
        dsv.created_time <= '${moment().format('YYYY-MM-DD 00:00:00')}' AND  
        dsv.employee_id_driver = ${payload.employee_id_driver} AND
        dsv.is_deleted = FALSE;
    `;
    const resultDataDriver = await RawQueryService.query(rawQueryDriver);
    for (const dataDriver of resultDataDriver) {
      // Cek Status OTW
      if ( toInteger(dataDriver.do_smd_status_id_last) == 3000) {
        throw new BadRequestException(`Driver tidak bisa di assign, karena sedang OTW !!`);
      }
      // Cek Status PROBLEM
      if ( toInteger(dataDriver.do_smd_status_id_last) == 8000) {
        throw new BadRequestException(`Driver tidak bisa di assign, karena sedang PROBLEM !!`);
      }
      // Cek Status HAS ARRIVED
      if ( toInteger(dataDriver.do_smd_status_id_last) == 4000) {
        throw new BadRequestException(`Driver tidak bisa di assign, karena baru tiba !!`);
      }
      // Cek Status INVALID
      if ( toInteger(dataDriver.do_smd_status_id_last) == 4050) {
        throw new BadRequestException(`Driver tidak bisa di assign, karena INVALID  !!`);
      }
      // Cek Status VALID
      if ( toInteger(dataDriver.do_smd_status_id_last) == 4100) {
        throw new BadRequestException(`Driver tidak bisa di assign, karena belum DITERIMA !!`);
      }
      // Cek Status Created, Assigned, Driver Changed
      if ( toInteger(dataDriver.do_smd_status_id_last) == 1000 || toInteger(dataDriver.do_smd_status_id_last) == 2000 || toInteger(dataDriver.do_smd_status_id_last) == 1050) {
        if (toInteger(dataDriver.branch_id) != toInteger(permissonPayload.branchId)) {
          throw new BadRequestException(`Driver Tidak boleh di assign beda cabang`);
        }
      } else if ( toInteger(dataDriver.do_smd_status_id_last) < 3000 ) {
        throw new BadRequestException(`Driver Tidak boleh di assign`);
      }
      // Cek Status Received, Finish
      if ( toInteger(dataDriver.do_smd_status_id_last) == 5000 || toInteger(dataDriver.do_smd_status_id_last) == 6000 ) {
        const resultDoSmdDetail = await DoSmdDetail.findOne({
          where: {
            doSmdId: dataDriver.do_smd_id,
            doSmdStatusIdLast: 5000,
            branchIdTo: permissonPayload.branchId,
            isDeleted: false,
          },
        });
        if (!resultDoSmdDetail) {
          throw new BadRequestException(`Driver tidak bisa di assign, karena SMD ID : ` + dataDriver.do_smd_id + ` beda cabang.`);
        }
      }
    }


    // if (resultDataDriver.length > 0) {
    //   // Cek Status OTW
    //   if ( toInteger(resultDataDriver[0].do_smd_status_id_last) == 3000) {
    //     throw new BadRequestException(`Driver tidak bisa di assign, karena sedang OTW !!`);
    //   }
    //   // Cek Status PROBLEM
    //   if ( toInteger(resultDataDriver[0].do_smd_status_id_last) == 8000) {
    //     throw new BadRequestException(`Driver tidak bisa di assign, karena sedang PROBLEM !!`);
    //   }
    //   // Cek Status HAS ARRIVED
    //   if ( toInteger(resultDataDriver[0].do_smd_status_id_last) == 4000) {
    //     throw new BadRequestException(`Driver tidak bisa di assign, karena baru tiba !!`);
    //   }
    //   // Cek Status INVALID
    //   if ( toInteger(resultDataDriver[0].do_smd_status_id_last) == 4050) {
    //     throw new BadRequestException(`Driver tidak bisa di assign, karena INVALID  !!`);
    //   }
    //   // Cek Status VALID
    //   if ( toInteger(resultDataDriver[0].do_smd_status_id_last) == 4100) {
    //     throw new BadRequestException(`Driver tidak bisa di assign, karena belum DITERIMA !!`);
    //   }
    //   // Cek Status Created, Assigned, Driver Changed
    //   if ( toInteger(resultDataDriver[0].do_smd_status_id_last) == 1000 || toInteger(resultDataDriver[0].do_smd_status_id_last) == 2000 || toInteger(resultDataDriver[0].do_smd_status_id_last) == 1050) {
    //     if (toInteger(resultDataDriver[0].branch_id) != toInteger(permissonPayload.branchId)) {
    //       throw new BadRequestException(`Driver Tidak boleh di assign beda cabang`);
    //     }
    //   } else if( toInteger(resultDataDriver[0].do_smd_status_id_last) < 3000 ) {
    //     throw new BadRequestException(`Driver Tidak boleh di assign`);
    //   }
    //   // Cek Status Received, Finish
    //   if ( toInteger(resultDataDriver[0].do_smd_status_id_last) == 5000 || toInteger(resultDataDriver[0].do_smd_status_id_last) == 6000 ) {
    //     const resultDoSmdDetail = await DoSmdDetail.findOne({
    //       where: {
    //         doSmdId: resultDataDriver[0].do_smd_id,
    //         doSmdStatusIdLast: 5000,
    //         branchIdTo: permissonPayload.branchId,
    //         isDeleted: false,
    //       },
    //     });
    //     if (!resultDoSmdDetail) {
    //       throw new BadRequestException(`Driver tidak bisa di assign, karena SMD ID : ` + resultDataDriver[0].do_smd_id + ` beda cabang.`);
    //     }
    //   }
    // }

    const  paramDoSmdCode = await CustomCounterCode.doSmdCodeRandomCounter(timeNow);
    const data = [];

    const redlock = await RedisService.redlock(`redlock:doSmd:${paramDoSmdCode}`, 10);
    if (redlock) {
      const paramDoSmdId = await this.createDoSmd(
        paramDoSmdCode,
        payload.smd_date,
        permissonPayload.branchId,
        authMeta.userId,
        payload.smd_trip,
        payload.description,
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
      data.push({
        do_smd_id: paramDoSmdId,
        do_smd_code: paramDoSmdCode,
        do_smd_vehicle_id: paramDoSmdVehicleId,
        departure_schedule_date_time: payload.do_smd_time,
        employee_id_driver: payload.employee_id_driver,
      });
    } else {
      throw new BadRequestException('Data Surat Muatan Darat Sedang di proses, Silahkan Coba Beberapa Saat');
    }

    result.statusCode = HttpStatus.OK;
    result.message = 'SMD berhasil dibuat';
    result.data = data;
    return result;
  }

  static async scanOutEmptyVehicle(payload: ScanOutSmdEmptyVehiclePayloadVm): Promise<ScanOutSmdEmptyVehicleResponseVm> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    const result = new ScanOutSmdEmptyVehicleResponseVm();
    const timeNow = moment().toDate();
    const resultbranchTo = await Branch.findOne({
      where: {
        branchId: payload.branch_id,
        isDeleted : false,
        isActive : true
      },
    });
    if (resultbranchTo) {
      const rawQueryDriver = `
        SELECT
          dsv.employee_id_driver,
          ds.do_smd_status_id_last,
          ds.do_smd_id,
          ds.branch_id
        FROM do_smd_vehicle dsv
        INNER JOIN do_smd ds ON dsv.do_smd_vehicle_id = ds.vehicle_id_last AND ds.is_empty = FALSE AND ds.do_smd_status_id_last <> 6000 AND ds.is_deleted = FALSE
        WHERE
          dsv.created_time >= '${moment().subtract(30,'days').format('YYYY-MM-DD 00:00:00')}' AND 
          dsv.created_time <= '${moment().format('YYYY-MM-DD 00:00:00')}' AND  
          dsv.employee_id_driver = ${payload.employee_id_driver} AND
          dsv.is_deleted = FALSE;
      `;
      const resultDataDriver = await RawQueryService.query(rawQueryDriver);
      for (const dataDriver of resultDataDriver) {
        // Cek Status OTW
        if ( toInteger(dataDriver.do_smd_status_id_last) == 3000) {
          throw new BadRequestException(`Driver tidak bisa di assign, karena sedang OTW !!`);
        }
        // Cek Status PROBLEM
        if ( toInteger(dataDriver.do_smd_status_id_last) == 8000) {
          throw new BadRequestException(`Driver tidak bisa di assign, karena sedang PROBLEM !!`);
        }
        // Cek Status HAS ARRIVED
        if ( toInteger(dataDriver.do_smd_status_id_last) == 4000) {
          throw new BadRequestException(`Driver tidak bisa di assign, karena baru tiba !!`);
        }
        // Cek Status INVALID
        if ( toInteger(dataDriver.do_smd_status_id_last) == 4050) {
          throw new BadRequestException(`Driver tidak bisa di assign, karena INVALID  !!`);
        }
        // Cek Status VALID
        if ( toInteger(dataDriver.do_smd_status_id_last) == 4100) {
          throw new BadRequestException(`Driver tidak bisa di assign, karena belum DITERIMA !!`);
        }
        // Cek Status Created, Assigned, Driver Changed
        if ( toInteger(dataDriver.do_smd_status_id_last) == 1000 || toInteger(dataDriver.do_smd_status_id_last) == 2000 || toInteger(dataDriver.do_smd_status_id_last) == 1050) {
          if (toInteger(dataDriver.branch_id) != toInteger(permissonPayload.branchId)) {
            throw new BadRequestException(`Driver Tidak boleh di assign beda cabang`);
          }
        } else if ( toInteger(dataDriver.do_smd_status_id_last) < 3000 ) {
          throw new BadRequestException(`Driver Tidak boleh di assign`);
        }
        // Cek Status Received, Finish
        if ( toInteger(dataDriver.do_smd_status_id_last) == 5000 || toInteger(dataDriver.do_smd_status_id_last) == 6000 ) {
          const resultDoSmdDetail = await DoSmdDetail.findOne({
            where: {
              doSmdId: dataDriver.do_smd_id,
              doSmdStatusIdLast: 5000,
              branchIdTo: permissonPayload.branchId,
              isDeleted: false,
            },
          });
          if (!resultDoSmdDetail) {
            throw new BadRequestException(`Driver tidak bisa di assign, karena SMD ID : ` + dataDriver.do_smd_id + ` beda cabang.`);
          }
        }
      }

      // if (resultDataDriver.length > 0) {
      //   // Cek Status OTW
      //   if ( toInteger(resultDataDriver[0].do_smd_status_id_last) == 3000) {
      //     throw new BadRequestException(`Driver tidak bisa di assign, karena sedang OTW !!`);
      //   }
      //   // Cek Status PROBLEM
      //   if ( toInteger(resultDataDriver[0].do_smd_status_id_last) == 8000) {
      //     throw new BadRequestException(`Driver tidak bisa di assign, karena sedang PROBLEM !!`);
      //   }
      //   // Cek Status HAS ARRIVED
      //   if ( toInteger(resultDataDriver[0].do_smd_status_id_last) == 4000) {
      //     throw new BadRequestException(`Driver tidak bisa di assign, karena baru tiba !!`);
      //   }
      //   // Cek Status INVALID
      //   if ( toInteger(resultDataDriver[0].do_smd_status_id_last) == 4050) {
      //     throw new BadRequestException(`Driver tidak bisa di assign, karena INVALID  !!`);
      //   }
      //   // Cek Status VALID
      //   if ( toInteger(resultDataDriver[0].do_smd_status_id_last) == 4100) {
      //     throw new BadRequestException(`Driver tidak bisa di assign, karena belum DITERIMA !!`);
      //   }
      //   // Cek Status Created, Assigned, Driver Changed
      //   if ( toInteger(resultDataDriver[0].do_smd_status_id_last) == 1000 || toInteger(resultDataDriver[0].do_smd_status_id_last) == 2000 || toInteger(resultDataDriver[0].do_smd_status_id_last) == 1050) {
      //     if (toInteger(resultDataDriver[0].branch_id) != toInteger(permissonPayload.branchId)) {
      //       throw new BadRequestException(`Driver Tidak boleh di assign beda cabang`);
      //     }
      //   } else if ( toInteger(resultDataDriver[0].do_smd_status_id_last) < 3000 ) {
      //     throw new BadRequestException(`Driver Tidak boleh di assign`);
      //   }
      //   // Cek Status Received, Finish
      //   if ( toInteger(resultDataDriver[0].do_smd_status_id_last) == 5000 || toInteger(resultDataDriver[0].do_smd_status_id_last) == 6000 ) {
      //     const resultDoSmdDetail = await DoSmdDetail.findOne({
      //       where: {
      //         doSmdId: resultDataDriver[0].do_smd_id,
      //         doSmdStatusIdLast: 5000,
      //         branchIdTo: permissonPayload.branchId,
      //         isDeleted: false,
      //       },
      //     });
      //     if (!resultDoSmdDetail) {
      //       throw new BadRequestException(`Driver tidak bisa di assign, karena SMD ID : ` + resultDataDriver[0].do_smd_id + ` beda cabang.`);
      //     }
      //   }
      // }
      const  paramDoSmdCode = await CustomCounterCode.doSmdEmptyCodeRandomCounter(timeNow);
      const data = [];

      const redlock = await RedisService.redlock(`redlock:doSmd:${paramDoSmdCode}`, 10);
      if (redlock) {
        const paramDoSmdId = await this.createDoSmd(
          paramDoSmdCode,
          payload.smd_city_date,
          permissonPayload.branchId,
          authMeta.userId,
          null,
          payload.description,
          true,
        );

        const paramDoSmdVehicleId = await this.createDoSmdVehicle(
          paramDoSmdId,
          payload.vehicle_number,
          payload.employee_id_driver,
          permissonPayload.branchId,
          authMeta.userId,
        );

        const paramDoSmdDetailId = await this.createDoSmdDetail(
          paramDoSmdId,
          paramDoSmdVehicleId,
          null,
          payload.smd_city_date,
          permissonPayload.branchId,
          resultbranchTo.branchId,
          authMeta.userId,
        );

        await DoSmd.update(
          { doSmdId : paramDoSmdId },
          {
            branchToNameList: resultbranchTo.branchName,
            doSmdDetailIdLast: paramDoSmdDetailId,
            doSmdVehicleIdLast: paramDoSmdVehicleId,
            userIdUpdated: authMeta.userId,
            updatedTime: timeNow,
          },
        );

        data.push({
          do_smd_id: paramDoSmdId,
          do_smd_code: paramDoSmdCode,
          do_smd_vehicle_id: paramDoSmdVehicleId,
          do_smd_detail_id: paramDoSmdDetailId,
          departure_schedule_date_time: payload.smd_city_date,
          branch_code: resultbranchTo.branchCode + ' ' + resultbranchTo.branchName,
          employee_id_driver: payload.employee_id_driver,
        });

        result.statusCode = HttpStatus.OK;
        result.message = 'SMD Kosong berhasil dibuat';
        result.data = data;
        return result;
      } else {
        throw new BadRequestException('Data Surat Muatan Darat Sedang di proses, Silahkan Coba Beberapa Saat');
      }

    } else {
      throw new BadRequestException('Branch Tidak Ditemukan');
    }
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
          isDeleted : false,
          isActive : true
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
              throw new BadRequestException(`Kode representative sudah di scan!!`);
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
              result.message = 'Rute SMD berhasil di update';
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
              throw new BadRequestException(`Kode representative sudah di scan!!`);
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
              result.message = 'Rute SMD berhasil dibuat';
              result.data = data;
              return result;
            }
          }
        } else {
          throw new BadRequestException(`Kode representative ${payload.representative_code} tidak ditemukan`);
        }

      } else {
        throw new BadRequestException(`Kode Gerai ${payload.branch_code} tidak ditemukan`);
      }

    } else {
      throw new BadRequestException(`ID SMD ${payload.do_smd_id.toString()} tidak ditemukan`);
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
          isDeleted : false,
          isActive : true
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
                  throw new BadRequestException(`Kode representative sudah di scan!!`);
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
                  paramsresultDoSmdDetailId = paramDoSmdDetailId;
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
            result.message = 'Rute SMD berhasil dibuat';
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
                throw new BadRequestException(`Kode representative sudah di scan!!`);
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
                result.message = 'Rute SMD berhasil di update';
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
                throw new BadRequestException(`Kode representative sudah di scan!!`);
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
                result.message = 'Rute SMD berhasil dibuat';
                result.data = data;
                return result;
              }
            }
          }
        } else {
          throw new BadRequestException(`Kode representative ${payload.representative_code} tidak ditemukan`);
        }

      } else {
        throw new BadRequestException(`Kode Gerai ${payload.branch_code} tidak ditemukan`);
      }

    } else {
      throw new BadRequestException(`ID SMD ${payload.do_smd_id.toString()} tidak ditemukan`);
    }

  }

  static async scanItemSMD(payload: any): Promise<any> {
    const result = await this.scanOutItem(payload);
    if (result.statusCode == 400) {
      throw new BadRequestException(result.message);
    }
    return result;
  }

  static async scanOutItem(payload: any): Promise<any> {
    // Bag Type 0 = Bagging, 1 =  Bag / Gab.Paket, 2 = Bag Representative / Gabung Sortir Kota
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    const result = new ScanOutSmdItemResponseVm();
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
            total_bag_representative
          FROM do_smd_detail , unnest(string_to_array(representative_code_list , ','))  s(code)
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
          result.message = `Gabung Kota ${payload.item_number} sudah di scan`;
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

          // await getManager().transaction(async transactionEntityManager => {
          //   await transactionEntityManager.increment(
          //     DoSmdDetail,
          //     {
          //       doSmdDetailId: resultDoSmdDetail.doSmdDetailId,
          //     },
          //     'totalBagRepresentative',
          //     1,
          //   );
          //   await transactionEntityManager.increment(
          //     DoSmd,
          //     {
          //       doSmdId: resultDoSmd.doSmdId,
          //     },
          //     'totalBagRepresentative',
          //     1,
          //   );
          //   await transactionEntityManager.increment(
          //     DoSmd,
          //     {
          //       doSmdId: resultDoSmd.doSmdId,
          //     },
          //     'totalItem',
          //     1,
          //   );
          // });

          const queryDoSmdDetail = `
            UPDATE do_smd_detail
            SET total_bag_representative = total_bag_representative + 1
            WHERE
              do_smd_detail_id = :doSmdDetailId
          `;
          const queryDoSmd = `
            UPDATE do_smd
            SET total_bag_representative = total_bag_representative + 1, total_item = total_item + 1
            WHERE
              do_smd_id = :doSmdId
          `;

          await RawQueryService.queryTranWithParams([
            {
              sql: queryDoSmdDetail,
              params: {
                doSmdDetailId: resultDoSmdDetail.doSmdDetailId,
              },
            },
            {
              sql: queryDoSmd,
              params:  { doSmdId: resultDoSmd.doSmdId }
            , },
          ]);

          BagRepresentativeScanDoSmdQueueService.perform(
            resultDataBagRepresentative[0].bag_representative_id,
            resultDataBagRepresentative[0].representative_id_to,
            resultDataBagRepresentative[0].bag_representative_code,
            resultDataBagRepresentative[0].bag_representative_date,
            resultDataBagRepresentative[0].total_item,
            resultDataBagRepresentative[0].total_weight,
            authMeta.userId,
            permissonPayload.branchId,
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
            weight: resultDataBagRepresentative[0].total_weight,
            representative_code: resultDataBagRepresentative[0].representative_code,
          });
          result.statusCode = HttpStatus.OK;
          result.message = `Gabung Kota ${payload.item_number} berhasil di scan`;
          result.data = data;
          return result;
        }
      } else {
        result.message = 'Tujuan Gabung Kota tidak cocok dengan perwakilan SMD';
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
            and bih.bag_item_status_id in(3550, 3500)
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
              // doSmdDetailId: resultDataRepresentative[0].do_smd_detail_id,
              baggingId: resultBagging.baggingId,
              isDeleted: false,
            },
          });
          if (resultDoSmdDetailItem) {
            result.message = `Bagging ${payload.item_number} sudah di scan`;
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
            // await getManager().transaction(async transactionEntityManager => {
            //   await transactionEntityManager.increment(
            //     DoSmdDetail,
            //     {
            //       doSmdDetailId: resultDoSmdDetail.doSmdDetailId,
            //     },
            //     'totalBagging',
            //     1,
            //   );
            //   await transactionEntityManager.increment(
            //     DoSmd,
            //     {
            //       doSmdId: resultDoSmd.doSmdId,
            //     },
            //     'totalBagging',
            //     1,
            //   );
            //   await transactionEntityManager.increment(
            //     DoSmd,
            //     {
            //       doSmdId: resultDoSmd.doSmdId,
            //     },
            //     'totalItem',
            //     1,
            //   );
            // });

            const queryDoSmdDetail = `
              UPDATE do_smd_detail
              SET total_bagging = total_bagging + 1
              WHERE
                do_smd_detail_id = :doSmdDetailId
            `;
            const queryDoSmd = `
              UPDATE do_smd
              SET total_bagging = total_bagging + 1, total_item = total_item + 1
              WHERE
                do_smd_id = :doSmdId
            `;

            await RawQueryService.queryTranWithParams([
              {
                sql: queryDoSmdDetail,
                params: {
                  doSmdDetailId: resultDoSmdDetail.doSmdDetailId,
                },
              },
              {
                sql: queryDoSmd,
                params:  { doSmdId: resultDoSmd.doSmdId }
              , },
            ]);

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
              bag_representative_id: null,
              bag_type: 0,
              bag_number: null,
              bagging_number: payload.item_number,
              bag_representative_code: null,
              total_bag: resultDoSmdDetail.totalBag,
              total_bagging: resultDoSmdDetail.totalBagging,
              total_bag_representative: resultDoSmdDetail.totalBagRepresentative,
              weight: resultBagging.totalWeight,
              representative_code: resultDataBagItem[0].representative_code,
            });
            result.statusCode = HttpStatus.OK;
            result.message = `Bagging ${payload.item_number} berhasil di scan`;
            result.data = data;
            return result;
          }
        } else {
          result.message = 'Tujuan Bagging tidak cocok dengan perwakilan SMD';
          return result;
        }
      } else if (resultDataBagItem.length > 0 && !resultDataBagItem[0].bag_item_status_id) {
        result.message = `Bagging ${payload.item_number} belum di scan masuk`;
        return result;
      } else {
        result.message = `Bagging ${payload.item_number} tidak ditemukan`;
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
            bih.bag_item_status_id,
            dsdi.do_smd_detail_id
          FROM bag_item bi
          INNER JOIN bag b ON b.bag_id = bi.bag_id AND b.is_deleted = FALSE
          LEFT JOIN representative  r on b.representative_id_to = r.representative_id and r.is_deleted  = FALSE
          LEFT JOIN bag_item_history bih on bih.bag_item_id = bi.bag_item_id and bih.is_deleted  = FALSE
            and bih.bag_item_status_id in (3550, 3500) AND bih.branch_id = '${permissonPayload.branchId}'
          LEFT JOIN do_smd_detail_item dsdi on dsdi.bag_item_id = bi.bag_item_id and dsdi.is_deleted = FALSE
            AND dsdi.branch_id_scan = '${permissonPayload.branchId}'
          WHERE
            b.bag_number = '${escape(paramBagNumber)}' AND
            bi.bag_seq = '${paramSeq}' AND
            bi.is_deleted = FALSE
          ORDER BY b.created_time DESC
          LIMIT 1;
        `;
        const resultDataBag = await RawQueryService.query(rawQuery);
        if (resultDataBag.length > 0 && resultDataBag[0].bag_item_status_id && !resultDataBag[0].do_smd_detail_id) {

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
              // await getManager().transaction(async transactionEntityManager => {
              //   await transactionEntityManager.increment(
              //     DoSmdDetail,
              //     {
              //       doSmdDetailId: resultDoSmdDetail.doSmdDetailId,
              //     },
              //     'totalBag',
              //     1,
              //   );
              //   await transactionEntityManager.increment(
              //     DoSmd,
              //     {
              //       doSmdId: resultDoSmd.doSmdId,
              //     },
              //     'totalBag',
              //     1,
              //   );
              //   await transactionEntityManager.increment(
              //     DoSmd,
              //     {
              //       doSmdId: resultDoSmd.doSmdId,
              //     },
              //     'totalItem',
              //     1,
              //   );
              // });

              const queryDoSmdDetail = `
                UPDATE do_smd_detail
                SET total_bag = total_bag + 1
                WHERE
                  do_smd_detail_id = :doSmdDetailId
              `;
              const queryDoSmd = `
                UPDATE do_smd
                SET total_bag = total_bag + 1, total_item = total_item + 1
                WHERE
                  do_smd_id = :doSmdId
              `;

              await RawQueryService.queryTranWithParams([
                {
                  sql: queryDoSmdDetail,
                  params: {
                    doSmdDetailId: resultDoSmdDetail.doSmdDetailId,
                  },
                },
                {
                  sql: queryDoSmd,
                  params:  { doSmdId: resultDoSmd.doSmdId }
                , },
              ]);

              const bagItemHistoryId = await this.createBagItemHistory(Number(resultDataBag[0].bag_item_id), authMeta.userId, permissonPayload.branchId, BAG_STATUS.IN_LINE_HAUL);
              await BagItem.update(
                { bagItemId : resultDataBag[0].bag_item_id },
                {
                  bagItemStatusIdLast: BAG_STATUS.IN_LINE_HAUL,
                  branchIdLast: permissonPayload.branchId,
                  bagItemHistoryId: Number(bagItemHistoryId),
                  userIdUpdated: authMeta.userId,
                  updatedTime: moment().toDate(),
                },
              );
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
                bag_representative_id: null,
                bag_type: 1,
                bag_number: payload.item_number,
                bagging_number: null,
                bag_representative_code: null,
                total_bag: resultDoSmdDetail.totalBag,
                total_bagging: resultDoSmdDetail.totalBagging,
                total_bag_representative: resultDoSmdDetail.totalBagRepresentative,
                weight,
                bag_seq: paramSeq,
                representative_code: resultDataBag[0].representative_code,
              });
              result.statusCode = HttpStatus.OK;
              result.message = `Gabung Paket ${payload.item_number} sudah di scan`;
              result.data = data;
              return result;
          } else {
            result.message = 'Tujuan Gabung Paket tidak cocok dengan perwakilan SMD';
            return result;
          }
        } else if (resultDataBag.length > 0 && resultDataBag[0].do_smd_detail_id) {
          result.message = `Gabung Paket ${payload.item_number} sudah di scan`;
          return result;
        } else if (resultDataBag.length > 0 && !resultDataBag[0].bag_item_status_id) {
          result.message = `Gabung Paket ${payload.item_number} belum di scan masuk`;
          return result;
        } else {
          result.message = `Gabung Paket ${payload.item_number} tidak ditemukan`;
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
            bih.bag_item_status_id,
            dsdi.do_smd_detail_id,
            bi.weight
          FROM bag_item bi
          INNER JOIN bag b ON b.bag_id = bi.bag_id AND b.is_deleted = FALSE
          LEFT JOIN representative  r on b.representative_id_to = r.representative_id and r.is_deleted  = FALSE
          LEFT JOIN bag_item_history bih on bih.bag_item_id = bi.bag_item_id and bih.is_deleted  = FALSE
            and bih.bag_item_status_id in( 3550, 3500) AND bih.branch_id = '${permissonPayload.branchId}'
          LEFT JOIN do_smd_detail_item dsdi on dsdi.bag_item_id = bi.bag_item_id and dsdi.is_deleted = FALSE
            AND dsdi.branch_id_scan = '${permissonPayload.branchId}'
          WHERE
            b.bag_number = '${escape(paramBagNumber)}' AND
            bi.bag_seq = '${paramSeq}' AND
            bi.is_deleted = FALSE
          ORDER BY b.created_time DESC
          LIMIT 1;
        `;
        const resultDataBag = await RawQueryService.query(rawQuery);
        if (resultDataBag.length > 0 && resultDataBag[0].bag_item_status_id && !resultDataBag[0].do_smd_detail_id) {

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
              // await getManager().transaction(async transactionEntityManager => {
              //   await transactionEntityManager.increment(
              //     DoSmdDetail,
              //     {
              //       doSmdDetailId: resultDoSmdDetail.doSmdDetailId,
              //     },
              //     'totalBag',
              //     1,
              //   );
              //   await transactionEntityManager.increment(
              //     DoSmd,
              //     {
              //       doSmdId: resultDoSmd.doSmdId,
              //     },
              //     'totalBag',
              //     1,
              //   );
              //   await transactionEntityManager.increment(
              //     DoSmd,
              //     {
              //       doSmdId: resultDoSmd.doSmdId,
              //     },
              //     'totalItem',
              //     1,
              //   );
              // });
              const queryDoSmdDetail = `
                UPDATE do_smd_detail
                SET total_bag = total_bag + 1
                WHERE
                  do_smd_detail_id = :doSmdDetailId
              `;
              const queryDoSmd = `
                UPDATE do_smd
                SET total_bag = total_bag + 1, total_item = total_item + 1
                WHERE
                  do_smd_id = :doSmdId
              `;

              await RawQueryService.queryTranWithParams([
                {
                  sql: queryDoSmdDetail,
                  params: {
                    doSmdDetailId: resultDoSmdDetail.doSmdDetailId,
                  },
                },
                {
                  sql: queryDoSmd,
                  params:  { doSmdId: resultDoSmd.doSmdId }
                , },
              ]);
              const bagItemHistoryId = await this.createBagItemHistory(Number(resultDataBag[0].bag_item_id), authMeta.userId, permissonPayload.branchId, BAG_STATUS.IN_LINE_HAUL);
              await BagItem.update(
                { bagItemId : resultDataBag[0].bag_item_id },
                {
                  bagItemStatusIdLast: BAG_STATUS.IN_LINE_HAUL,
                  branchIdLast: permissonPayload.branchId,
                  bagItemHistoryId: Number(bagItemHistoryId),
                  userIdUpdated: authMeta.userId,
                  updatedTime: moment().toDate(),
                },
              );
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
                bag_representative_id: null,
                bag_type: 1,
                bag_number: payload.item_number,
                bagging_number: null,
                bag_representative_code: null,
                total_bag: resultDoSmdDetail.totalBag,
                total_bagging: resultDoSmdDetail.totalBagging,
                total_bag_representative: resultDoSmdDetail.totalBagRepresentative,
                weight: resultDataBag[0].weight,
                bag_seq: paramSeq,
                representative_code: resultDataBag[0].representative_code,
              });
              result.statusCode = HttpStatus.OK;
              result.message = `Gabung Paket ${payload.item_number} berhasil di scan`;
              result.data = data;
              return result;
          } else {
            result.message = 'Tujuan Gabung Paket tidak cocok dengan perwakilan SMD';
            return result;
          }
        } else if (resultDataBag.length > 0 && resultDataBag[0].do_smd_detail_id) {
          result.message = `Gabung Paket ${payload.item_number} sudah di scan`;
          return result;
        } else if (resultDataBag.length > 0 && !resultDataBag[0].bag_item_status_id) {
          result.message = `Gabung Paket ${payload.item_number} belum di scan masuk`;
          return result;
        } else {
          result.message = `Gabung Paket ${payload.item_number} tidak ditemukan`;
          return result;
        }
      } else {
        result.message = 'Bagging/Gabung Paket tidak ditemukan';
        return result;
      }
    }

  }

  static async scanOutItemMore(
    payload: ScanOutSmdItemMorePayloadVm,
  ): Promise<ScanOutSmdItemMoreResponseVm> {
    const result = new ScanOutSmdItemMoreResponseVm();
    const p = new ScanOutSmdItemPayloadVm();
    let totalSuccess = 0;
    let totalError = 0;
    const uniqueNumber = [];
    p.do_smd_id = payload.do_smd_id;
    result.data = [];

    // TODO:
    // 1. get response scanOutItem of each item_number
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
        } as ScanOutSmdItemMoreDataResponseVm);
        continue;
      }
      uniqueNumber.push(number);

      const res = await this.scanOutItem(p) as ScanOutSmdItemResponseVm;
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
    result.totalError = totalError;
    result.totalSuccess = totalSuccess;
    return result;
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
    const bagItemHistory = await BagItemHistory.insert(resultbagItemHistory);
    return bagItemHistory.identifiers.length
      ? bagItemHistory.identifiers[0].bagItemHistoryId
      : null;
  }

  static async scanOutSeal(payload: any): Promise<any> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    const result = new ScanOutSmdSealResponseVm();
    const timeNow = moment().toDate();
    const data = [];
    let rawQuery;

    const rawQueryDriver = `
      SELECT
        dsv.employee_id_driver,
        ds.do_smd_status_id_last,
        ds.do_smd_id,
        ds.branch_id
      FROM do_smd_vehicle dsv
      INNER JOIN do_smd ds ON dsv.do_smd_id = ds.do_smd_id AND ds.is_deleted = FALSE AND do_smd_status_id_last = 3000
      WHERE
        dsv.employee_id_driver = ${payload.employee_id_driver} AND dsv.is_deleted = FALSE
    `;
    const resultDataDriver = await RawQueryService.query(rawQueryDriver);

    if (resultDataDriver.length > 0) {
      throw new BadRequestException(`Harap ubah driver terlebih dahulu, karena driver sudah BERANGKAT`);
    }

    if (payload.seal_seq == 1) {
      rawQuery = `
        SELECT
          dsd.do_smd_detail_id
        FROM do_smd_detail dsd
        WHERE
          dsd.do_smd_id = ${payload.do_smd_id} AND
          dsd.arrival_time IS NULL AND
          dsd.seal_number IS NULL AND
          dsd.is_deleted = FALSE
        ;
      `;
    } else {
      rawQuery = `
        SELECT
          dsd.do_smd_detail_id
        FROM do_smd_detail dsd
        WHERE
          dsd.do_smd_id = ${payload.do_smd_id} AND
          dsd.arrival_time IS NULL AND
          dsd.is_deleted = FALSE
        ;
      `;
    }
    const resultDataDoSmdDetail = await RawQueryService.query(rawQuery);
    if (resultDataDoSmdDetail.length > 0 ) {
      const idDetail = [];
      for (const dataDetailSmd of resultDataDoSmdDetail) {
        idDetail.push(dataDetailSmd.do_smd_detail_id);
      }
      // proses seal jika smd sudah pernah scan item
      const checkItemSmd = await DoSmdDetailItem.findOne({
        select: ['doSmdDetailId'],
        where: {
          doSmdDetailId: In(idDetail),
          isDeleted: false,
        },
      });
      if (checkItemSmd) {
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
        await DoSmd.update(
          { doSmdId : payload.do_smd_id },
          {
            sealNumberLast: payload.seal_number,
            userIdUpdated: authMeta.userId,
            updatedTime: timeNow,
          },
        );
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
        throw new BadRequestException(`SMD belum pernah di scan`);
      }
    } else {
      throw new BadRequestException(`Update nomor seal gagal`);
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
      if (resultDoSmd.doSmdStatusIdLast == 1000 || resultDoSmd.doSmdStatusIdLast == 2000) {
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
        throw new BadRequestException(`SMD Code ` + resultDoSmd.doSmdCode + ` Status tidak Created / Assigned`);
      }
    } else {
      throw new BadRequestException(`ID SMD ` + paramdoSmdId + ` tidak ditemukan!`);
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
          do_smd_vehicle_id,
          employee_id_driver
        FROM do_smd_vehicle
        WHERE
          do_smd_vehicle_id = ${resultDoSmd.doSmdVehicleIdLast} AND
          is_active = TRUE AND
          reason_id IS NOT NULL AND
          is_deleted = FALSE;
      `;
      const resultDataDoSmdVehicle = await RawQueryService.query(rawQuery);
      if (resultDataDoSmdVehicle.length > 0 ) {
        if (resultDataDoSmdVehicle[0].employee_id_driver != payload.employee_id_driver) {
          const resultAllDriverVehicle = await this.findAllActiveVehicleInDriver(resultDataDoSmdVehicle[0].employee_id_driver);
          const arrSmd = [];
          const vehicleId = [];
          for (const item of resultAllDriverVehicle) {
            vehicleId.push(item.doSmdVehicleId);
          }

          const dataDoSmd = await DoSmd.find({
            where: {
              doSmdVehicleIdLast: In(vehicleId),
              doSmdStatusIdLast: 8000,
              isDeleted: false,
            },
          });

          for (const item of dataDoSmd) {
            // Set Active False yang lama
            await DoSmdVehicle.update(
              { doSmdVehicleId : item.doSmdVehicleIdLast },
              {
                isActive: false,
                userIdUpdated: authMeta.userId,
                updatedTime: moment().toDate(),
              },
            );
            // Create Vehicle Dulu dan jangan update ke do_smd
            const paramDoSmdVehicleId = await this.createDoSmdVehicle(
              item.doSmdId,
              payload.vehicle_number,
              payload.employee_id_driver,
              permissonPayload.branchId,
              authMeta.userId,
            );

            const paramDoSmdHistoryId = await this.createDoSmdHistory(
              item.doSmdId,
              null,
              item.doSmdVehicleIdLast,
              null,
              null,
              item.doSmdTime,
              permissonPayload.branchId,
              1150,
              null,
              null,
              authMeta.userId,
            );

            item.doSmdStatusIdLast = 1150;
            item.userIdUpdated = authMeta.userId;
            item.updatedTime = moment().toDate();
            await item.save();

            await DoSmdDetail.update(
              { doSmdId :  item.doSmdId, arrivalTime: null},
              {
                doSmdStatusIdLast: 1150,
                userIdUpdated: authMeta.userId,
                updatedTime: moment().toDate(),
              },
            );

            data.push({
              do_smd_id: item.doSmdId,
              do_smd_code: item.doSmdCode,
              do_smd_vehicle_id: paramDoSmdVehicleId,
            });
            arrSmd.push(item.doSmdCode);
          }
          result.statusCode = HttpStatus.OK;
          result.message = 'Nomor SMD ' + arrSmd.join(',') + ' berhasil handover';
          result.data = data;
          return result;
        } else {
          throw new BadRequestException(`Tidak bisa handover ke supir yang sama`);
        }
      } else {
        throw new BadRequestException(`Alasan masalah tidak ditemukan di nomor SMD: ` + resultDoSmd.doSmdCode);
      }
    } else {
      throw new BadRequestException(`ID SMD ` + payload.do_smd_id + ` tidak ditemukan!`);
    }
  }

  static async findAllActiveVehicleInDriver(employee_id_driver: number): Promise<DoSmdVehicle[]> {
    const resultDoSmd = await DoSmdVehicle.find({
      where: {
        employeeIdDriver: employee_id_driver,
        reasonId: Not(IsNull()),
        isDeleted: false,
      },
    });
    return resultDoSmd;
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
        if (resultDataDoSmdVehicle[0].employee_id_driver != payload.employee_id_driver) {
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
            result.message = 'Berhasil ganti kendaraan SMD ' + resultDoSmd.doSmdCode;
          } else {
            result.message = 'Berhasil ganti supir SMD ' + resultDoSmd.doSmdCode;
          }

          result.data = data;
          return result;
        } else {
          throw new BadRequestException(`Tidak bisa handover ke supir yang sama`);
        }
      } else {
        throw new BadRequestException(`Alasan masalah tidak ditemukan di nomor SMD: ` + resultDoSmd.doSmdCode);
      }
    } else {
      throw new BadRequestException(`ID SMD ${payload.do_smd_id} tidak ditemukan`);
    }
  }

  static async scanOutEdit(payload: any): Promise<any> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    const result = new ScanOutSmdEditResponseVm();
    const timeNow = moment().toDate();
    const data = [];

    const resultDoSmd = await DoSmd.findOne({
      where: {
        doSmdId: payload.do_smd_id,
        doSmdStatusIdLast: In([1000, 1050, 2000]),
        isDeleted: false,
      },
    });
    if (resultDoSmd) {
      const resultDoSmdVehicle = await DoSmdVehicle.findOne({
        where: {
          doSmdVehicleId: resultDoSmd.doSmdVehicleIdLast,
          isDeleted: false,
        },
      });

      const rawQuery = `
        SELECT
          ds.do_smd_id,
          ds.seal_number_last,
          dsd.do_smd_detail_id,
          dsd.branch_id_from,
          bf.branch_code as branch_code_from,
          bf.branch_name as branch_name_from,
          dsd.branch_id_to,
          bt.branch_code as branch_code_to,
          bt.branch_name as branch_name_to,
          dsd.representative_code_list,
          dsd.total_bag,
          dsd.total_bagging,
          dsd.total_bag_representative
        FROM do_smd ds
        INNER JOIN do_smd_detail dsd ON ds.do_smd_id = dsd.do_smd_id AND dsd.is_deleted = FALSE
        LEFT JOIN branch bf ON dsd.branch_id_from = bf.branch_id AND bf.is_deleted = FALSE
        LEFT JOIN branch bt ON dsd.branch_id_to = bt.branch_id AND bt.is_deleted = FALSE
        WHERE
          ds.do_smd_id = ${resultDoSmd.doSmdId} AND
          ds.is_deleted = FALSE;
      `;
      const resultDataDoSmdDetail = await RawQueryService.query(rawQuery);
      if (resultDataDoSmdDetail.length > 0 ) {
        for (let i = 0; i < resultDataDoSmdDetail.length; i++) {
          data.push({
            do_smd_id: resultDoSmd.doSmdId,
            do_smd_code: resultDoSmd.doSmdCode,
            do_smd_time: resultDoSmd.doSmdTime,
            do_smd_vehicle_id: resultDoSmd.doSmdVehicleIdLast,
            user_id_driver: resultDoSmdVehicle.employeeIdDriver,
            vehicle_number: resultDoSmdVehicle.vehicleNumber,
            do_smd_detail_id: resultDataDoSmdDetail[i].do_smd_detail_id,
            branch_id_from: resultDataDoSmdDetail[i].branch_id_from,
            branch_code_from: resultDataDoSmdDetail[i].branch_code_from,
            branch_name_from: resultDataDoSmdDetail[i].branch_name_from,
            branch_id_to: resultDataDoSmdDetail[i].branch_id_to,
            branch_code: resultDataDoSmdDetail[i].branch_code_to,
            branch_name: resultDataDoSmdDetail[i].branch_name_to,
            representative_code_list: resultDataDoSmdDetail[i].representative_code_list,
            total_bag: resultDataDoSmdDetail[i].total_bag,
            total_bag_representative: resultDataDoSmdDetail[i].total_bag_representative,
            total_bagging: resultDataDoSmdDetail[i].total_bagging,
            seal_number: resultDataDoSmdDetail[i].seal_number_last,
          });
        }
        result.statusCode = HttpStatus.OK;
        result.data = data;
        return result;
      } else {
        throw new BadRequestException(`Tidak ditemukan tujuan pada ID SMD ` + payload.do_smd_id);
      }
    } else {
      throw new BadRequestException(`ID SMD ${payload.do_smd_id} tidak ditemukan`);
    }
  }

  static async scanOutEditDetail(payload: any): Promise<any> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    const result = new ScanOutSmdEditDetailResponseVm();
    const timeNow = moment().toDate();
    const data = [];

    const resultDoSmdDetail = await DoSmdDetail.findOne({
      where: {
        doSmdDetailId: payload.do_smd_detail_id,
        isDeleted: false,
      },
    });
    if (resultDoSmdDetail) {
      const rawQueryBagging = `
        SELECT
          DISTINCT dsdi.bagging_id,
          b.bagging_code,
          b.total_weight as weight,
          r.representative_code
        FROM do_smd_detail_item dsdi
        INNER JOIN bagging b ON dsdi.bagging_id = b.bagging_id AND b.is_deleted = FALSE
        INNER JOIN representative r ON r.representative_id = b.representative_id_to AND r.is_deleted = FALSE
        WHERE
          dsdi.do_smd_detail_id = ${resultDoSmdDetail.doSmdDetailId} AND
          dsdi.bag_type = 0 AND
          dsdi.is_deleted = FALSE;
      `;
      const resultDataBagging = await RawQueryService.query(rawQueryBagging);
      if (resultDataBagging.length > 0 ) {
        for (let i = 0; i < resultDataBagging.length; i++) {
          data.push({
            do_smd_detail_id: resultDoSmdDetail.doSmdDetailId,
            bag_id: null,
            bag_item_id: null,
            bag_number: null,
            bag_representative_code: null,
            bag_representative_id: null,
            bag_type: 0,
            bagging_id: resultDataBagging[i].bagging_id,
            bagging_number: resultDataBagging[i].bagging_code,
            weight: resultDataBagging[0].weight,
            bag_seq: resultDataBagging[0].bag_seq,
            representative_code: resultDataBagging[0].representative_code,
          });
        }
      }
      const rawQueryBag = `
        SELECT
          DISTINCT dsdi.bag_item_id,
          dsdi.bag_id,
          CONCAT(b.bag_number, LPAD(bi.bag_seq::text, 3, '0')) as bag_number_seq,
          bi.weight,
          bi.bag_seq,
          r.representative_code
        FROM do_smd_detail_item dsdi
        INNER JOIN bag_item bi on dsdi.bag_item_id = bi.bag_item_id and bi.is_deleted = FALSE
        INNER JOIN bag b on bi.bag_id = b.bag_id and b.is_deleted = FALSE
        INNER JOIN representative r ON r.representative_id = b.representative_id_to AND r.is_deleted = FALSE
        WHERE
          dsdi.do_smd_detail_id = ${resultDoSmdDetail.doSmdDetailId} AND
          dsdi.bag_type = 1 AND
          dsdi.bag_item_id IS NOT NULL AND
          dsdi.is_deleted = FALSE;
      `;
      const resultDataBag = await RawQueryService.query(rawQueryBag);
      if (resultDataBag.length > 0 ) {
        for (let i = 0; i < resultDataBag.length; i++) {
          data.push({
            do_smd_detail_id: resultDoSmdDetail.doSmdDetailId,
            bag_id: resultDataBag[i].bag_id,
            bag_item_id: resultDataBag[i].bag_item_id,
            bag_number: resultDataBag[i].bag_number_seq,
            bag_representative_code: null,
            bag_representative_id: null,
            bag_type: 1,
            bagging_id: null,
            bagging_number: null,
            weight: resultDataBag[0].weight,
            bag_seq: resultDataBag[0].bag_seq,
            representative_code: resultDataBag[0].representative_code,
          });
        }
      }
      const rawQueryBagRepresentative = `
        SELECT
          DISTINCT dsdi.bag_representative_id,
          br.bag_representative_code,
          br.total_weight,
          r.representative_code
        FROM do_smd_detail_item dsdi
        INNER JOIN bag_representative br on dsdi.bag_representative_id = br.bag_representative_id and br.is_deleted = FALSE
        INNER JOIN representative r ON r.representative_id = br.representative_id_to AND r.is_deleted = FALSE
        WHERE
          dsdi.do_smd_detail_id = ${resultDoSmdDetail.doSmdDetailId} AND
          dsdi.bag_type = 2 AND
          dsdi.bag_representative_id IS NOT NULL AND
          dsdi.is_deleted = FALSE;
      `;
      const resultDataBagRepresentative = await RawQueryService.query(rawQueryBagRepresentative);
      if (resultDataBagRepresentative.length > 0 ) {
        for (let i = 0; i < resultDataBagRepresentative.length; i++) {
          data.push({
            do_smd_detail_id: resultDoSmdDetail.doSmdDetailId,
            bag_id: null,
            bag_item_id: null,
            bag_number: null,
            bag_representative_code: resultDataBagRepresentative[i].bag_representative_code,
            bag_representative_id: resultDataBagRepresentative[i].bag_representative_id,
            bag_type: 2,
            bagging_id: null,
            bagging_number: null,
            weight: resultDataBagRepresentative[i].total_weight,
            representative_code: resultDataBagRepresentative[0].representative_code,
          });
        }
      }
      result.statusCode = HttpStatus.OK;
      result.data = data;
      return result;
    } else {
      throw new BadRequestException(`ID Tujuan SMD ` + payload.do_smd_detail_id + ` tidak ditemukan!`);
    }
  }

  private static async createDoSmd(
    paramDoSmdCode: string,
    paramDoSmdTime: Date,
    paramBranchId: number,
    userId: number,
    paramCounterTrip: number,
    description: string,
    isEmpty = false,
  ) {
    const dataDoSmd = DoSmd.create({
      doSmdCode: paramDoSmdCode,
      doSmdTime: paramDoSmdTime,
      userId,
      branchId: paramBranchId,
      totalVehicle: 1,
      departureScheduleDateTime: paramDoSmdTime,
      counterTrip: paramCounterTrip,
      doSmdNote: description,
      isVendor: false,
      isIntercity: 0,
      isEmpty,
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
        dsd.branch_id_to = '${unassigningSMD[0].branch_id_to}' AND
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
          dsd.branch_id_to = '${unassigningSMD[0].branch_id_to}' AND
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

  static async changeSealManual(payload: SealChangeManualPayloadVm): Promise<any> {
    const authMeta = AuthService.getAuthData();
    const doSmd = await DoSmd.findOne({
      where: {
        doSmdCode: payload.doSmdCode,
        isDeleted: false,
        // sealNumberLast: IsNull(),
      },
    });

    if (doSmd && !doSmd.sealNumberLast) {
      const doSmdDetails = await DoSmdDetail.find({
        where: {
          doSmdId: doSmd.doSmdId,
          isDeleted: false,
          // sealNumber: IsNull(),
        },
      });

      const doSmdVehicle = await DoSmdVehicle.findOne({
        where: {
          doSmdId: doSmd.doSmdId,
          isDeleted: false,
        },
      });

      if (!doSmdVehicle) {
        RequestErrorService.throwObj({
          message: 'can\'t proccess dmd vendor',
        });
      }

      const doSmdHistory = await DoSmdHistory.findOne({
        where: {
          doSmdId: doSmd.doSmdId,
          doSmdStatusId: 1200, // status change seal
          sealNumber: payload.sealNumber,
        },
      });

      const doSmdId = doSmd.doSmdId;
      const doSmdVehicleId = doSmdVehicle.doSmdVehicleId;
      const timeNow = moment().toDate();

      if (!doSmdHistory) {
        await DoSmd.update(
          { doSmdId : doSmd.doSmdId },
          {
            sealNumberLast: payload.sealNumber,
            userIdUpdated: authMeta.userId,
            updatedTime: timeNow,
          },
        );
        for (const doSmdDetail of doSmdDetails) {
          await DoSmdDetail.update(
            { doSmdDetailId : doSmdDetail.doSmdDetailId },
            {
              sealNumber: payload.sealNumber,
              userIdUpdated: authMeta.userId,
              updatedTime: timeNow,
            },
          );
        }

        const paramDoSmdHistoryId = await this.createDoSmdHistory(
          doSmdId,
          doSmdDetails[0].doSmdDetailId,
          doSmdVehicleId,
          null,
          null,
          doSmd.doSmdTime,
          121, // branch kantor pusat
          1200, // status seal change
          payload.sealNumber,
          null,
          authMeta.userId, // user superadmin
        );
      }

      const response = {
        status: 'ok',
        message: 'Update seal number success',
      };

      return response;
    }
    if (doSmd && doSmd.sealNumberLast) {
      RequestErrorService.throwObj({
        message: 'SMD code: ' + payload.doSmdCode + ' already has seal number',
      });
    } else {
      RequestErrorService.throwObj({
        message: 'SMD code: ' + payload.doSmdCode + ' not found',
      });
    }
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
