
import moment = require('moment');
import { BadRequestException, Injectable } from '@nestjs/common';
import { AuthService } from '../../../../../shared/services/auth.service';
import { SortationScanOutVehiclePayloadVm } from '../../../models/sortation/web/sortation-scanout-payload.vm';
import { SortationScanOutVehicleResponseVm } from '../../../models/sortation/web/sortation-scanout-response.vm';
import { RawQueryService } from '../../../../../shared/services/raw-query.service';
import { DO_SORTATION_STATUS } from '../../../../../shared/constants/do-sortation-status.constant';
import { toInteger } from 'lodash';
import { DoSortationDetail } from '../../../../../shared/orm-entity/do-sortation-detail';
import { CustomCounterCode } from '../../../../../shared/services/custom-counter-code.service';
import { RedisService } from '../../../../../shared/services/redis.service';
import { DoSortation } from '../../../../../shared/orm-entity/do-sortation';
import { SortationService } from './sortation.service';

@Injectable()
export class SortationScanOutService {
  static async sortationScanOutVehicle(
    payload: SortationScanOutVehiclePayloadVm)
    : Promise<SortationScanOutVehicleResponseVm> {
      const authMeta = AuthService.getAuthData();
      const permissonPayload = AuthService.getPermissionTokenPayload();
      const timeNow = moment().toDate();

      const dataDrivers = await this.getDataDriver(payload.employeeDriverId);
      if (dataDrivers) {
        for (const dataDriver of dataDrivers) {
          await this.validationDriverStatus(dataDriver, permissonPayload.branchId);
        }
      }

      const doSortationCode = await CustomCounterCode.doSortationCodeRandomCounter(timeNow);
      const redlock = await RedisService.redlock(`redlock:doSortation:${doSortationCode}`, 10);

      if (!redlock) {
        throw new BadRequestException('Data Surat Jalan Sortation Sedang di proses, Silahkan Coba Beberapa Saat');
      }

      const doSortationId = await SortationService.createDoSortation(
            doSortationCode,
            payload.doSortationDate,
            permissonPayload.branchId,
            authMeta.userId,
            payload.sortationTrip,
            payload.desc,
            DO_SORTATION_STATUS.CREATED,
          );

      const doSortationVehicleId = await SortationService.createDoSortationVehicle(
            doSortationId,
            payload.vehicleId,
            payload.vehicleNumber,
            1,
            payload.employeeDriverId,
            permissonPayload.branchId,
            authMeta.userId,
          );

      await DoSortation.update(
            { doSortationId },
            {
              doSortationVehicleIdLast: doSortationVehicleId,
              userIdUpdated: authMeta.userId,
              updatedTime: timeNow,
            },
          );

      await SortationService.createDoSortationHistory(
            doSortationId,
            null,
            doSortationVehicleId,
            payload.doSortationDate,
            permissonPayload.branchId,
            DO_SORTATION_STATUS.CREATED,
            null,
            authMeta.userId,
          );

      const result = new SortationScanOutVehicleResponseVm();
      result.doSortationId = doSortationId;
      result.doSortationCode = doSortationCode;
      result.doSortationVehicleId = doSortationVehicleId;
      result.doSortationTime = payload.doSortationDate;
      result.employeeIdDriver = payload.employeeDriverId;
      return result;
  }

  private static async getDataDriver(employeeDriverId: number): Promise<any> {
    const rawQueryDriver = `
      SELECT
        dsv.employee_driver_id,
        ds.do_sortation_status_id_last,
        ds.do_sortation_id,
        ds.branch_id_from
      FROM do_sortation_vehicle dsv
      INNER JOIN do_sortation ds ON dsv.do_sortation_vehicle_id = ds.do_sortation_vehicle_id_last
        AND ds.do_sortation_status_id_last <> ${DO_SORTATION_STATUS.FINISHED}
        AND ds.is_deleted = FALSE
      WHERE
        dsv.created_time >= '${moment().subtract(30, 'days').format('YYYY-MM-DD 00:00:00')}' AND
        dsv.created_time <= '${moment().format('YYYY-MM-DD 23:59:59')}' AND dsv.employee_driver_id = ${employeeDriverId} AND
        dsv.is_deleted = FALSE;
    `;
    return await RawQueryService.query(rawQueryDriver);
  }

  private static async validationDriverStatus(dataDriver: any, payloadBranchId: number) {
    // Cek Status OTW
    if ( toInteger(dataDriver.do_sortation_status_id_last) == DO_SORTATION_STATUS.ON_THE_WAY) {
      throw new BadRequestException(`Driver tidak bisa di assign, karena sedang OTW !!`);
    }
    // Cek Status PROBLEM
    if ( toInteger(dataDriver.do_sortation_status_id_last) == DO_SORTATION_STATUS.PROBLEM) {
      throw new BadRequestException(`Driver tidak bisa di assign, karena sedang PROBLEM !!`);
    }
    // Cek Status HAS ARRIVED
    if ( toInteger(dataDriver.do_sortation_status_id_last) == DO_SORTATION_STATUS.HAS_ARRIVED) {
      throw new BadRequestException(`Driver tidak bisa di assign, karena baru tiba !!`);
    }
    // Cek Status INVALID
    if ( toInteger(dataDriver.do_sortation_status_id_last) == DO_SORTATION_STATUS.INVALID) {
      throw new BadRequestException(`Driver tidak bisa di assign, karena INVALID  !!`);
    }
    // Cek Status VALID
    if ( toInteger(dataDriver.do_sortation_status_id_last) == DO_SORTATION_STATUS.VALID) {
      throw new BadRequestException(`Driver tidak bisa di assign, karena belum DITERIMA !!`);
    }
    // Cek Status Created, Assigned, Driver Changed
    if ( toInteger(dataDriver.do_sortation_status_id_last) == DO_SORTATION_STATUS.CREATED
        || toInteger(dataDriver.do_sortation_status_id_last) == DO_SORTATION_STATUS.ASSIGNED
        || toInteger(dataDriver.do_sortation_status_id_last) == DO_SORTATION_STATUS.DRIVER_CHANGED) {
        if (toInteger(dataDriver.branch_id) != toInteger(payloadBranchId)) {
          throw new BadRequestException(`Driver Tidak boleh di assign beda cabang`);
        }
    } else if ( toInteger(dataDriver.do_sortation_status_id_last) < DO_SORTATION_STATUS.ON_THE_WAY ) {
      throw new BadRequestException(`Driver Tidak boleh di assign`);
    }
    // Cek Status Received
    if ( toInteger(dataDriver.do_sortation_status_id_last) == DO_SORTATION_STATUS.RECEIVED) {
      const resultDoSortationDetail = await DoSortationDetail.findOne({
        where: {
          doSmdId: dataDriver.do_smd_id,
          doSmdStatusIdLast: DO_SORTATION_STATUS.RECEIVED,
          branchIdTo: payloadBranchId,
          isDeleted: false,
        },
      });
      if (!resultDoSortationDetail) {
        throw new BadRequestException(`Driver tidak bisa di assign, karena SMD ID : ` + dataDriver.do_sortation_id + ` beda cabang.`);
      }
    }
  }

}
