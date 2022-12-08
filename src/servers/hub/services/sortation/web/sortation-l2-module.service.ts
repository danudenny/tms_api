import {BadRequestException, HttpStatus, Inject, Injectable} from '@nestjs/common';
import {
  SortationL2ModuleFinishManualPayloadVm,
  SortationL2ModuleHandoverPayloadVm,
  SortationL2ModuleSearchPayloadVm,
} from '../../../models/sortation/web/sortation-l2-module-search.payload.vm';
import {getManager, In, Not} from 'typeorm';
import {DO_SORTATION_STATUS} from '../../../../../shared/constants/do-sortation-status.constant';
import {SortationL2ModuleSearchResponseVm} from '../../../models/sortation/web/sortation-l2-module-search.response.vm';
import {DoSortation} from '../../../../../shared/orm-entity/do-sortation';
import {AuthService} from '../../../../../shared/services/auth.service';
import {DoSortationDetail} from '../../../../../shared/orm-entity/do-sortation-detail';
import {SortationHandoverResponseVm} from '../../../models/sortation/web/sortation-scanout-response.vm';
import {RawQueryService} from '../../../../../shared/services/raw-query.service';
import {DoSortationVehicle} from '../../../../../shared/orm-entity/do-sortation-vehicle';
import {SortationService} from './sortation.service';
import {
  SORTATION_EXTERNAL_MODULE_SERVICE,
  SortationExternalModulesService,
} from '../../../interfaces/sortation-external-modules.service';
import moment = require('moment');
import {SortationL2ModuleFinishResponseVm} from '../../../models/sortation/web/sortation-l2-module-finish.response.vm';

@Injectable()
export class SortationL2ModuleService {

  constructor(
      @Inject(SORTATION_EXTERNAL_MODULE_SERVICE) private readonly externalL2: SortationExternalModulesService,
  ) {
  }

  public async externalSearchSortation(payload: SortationL2ModuleSearchPayloadVm): Promise<SortationL2ModuleSearchResponseVm> {
    try {
      const res = await this.externalL2.search(payload);
      const result = new SortationL2ModuleSearchResponseVm();
      result.statusCode = HttpStatus.OK;
      result.message = 'Success search sortation code';
      result.data = res.data;
      return result;
    } catch (e) {
      throw e.message;
    }
  }

  public async externalFinishSortation(payload: SortationL2ModuleFinishManualPayloadVm): Promise<SortationL2ModuleFinishResponseVm> {

    const authMeta = AuthService.getAuthData();
    const externalPayload = {
      do_sortation_code: payload.doSortationCode,
      user_id: Number(authMeta.userId),
    };


    const res = await this.externalL2.finish(externalPayload);
    const resData = res.data;
    const resultData = [];
    if (resData.length  > 0) {
      resultData.push({
        doSortationId : resData[0].do_sortation_id,
        doSortationCode : resData[0].do_sortation_code,
      });
    }
    const result = new SortationL2ModuleFinishResponseVm();
    result.statusCode = HttpStatus.OK;
    result.message = 'Success finish sortation code';
    result.data = resultData;
    return result;
  }

  // public static async finishManualSortation(payload: SortationL2ModuleFinishManualPayloadVm) {
  //   const timeNow = moment().toDate();
  //   const authMeta = AuthService.getAuthData();
  //
  //   const findDoSortation = await DoSortation.findOne({
  //     where: {
  //       doSortationCode: payload.doSortationCode,
  //       isDeleted: false,
  //       doSortationStatusIdLast: Not(DO_SORTATION_STATUS.FINISHED),
  //     },
  //   });
  //
  //   if (findDoSortation) {
  //     await getManager().transaction(async transaction => {
  //       await transaction.update(DoSortation, {
  //         doSortationId: findDoSortation.doSortationId,
  //       }, {
  //         doSortationStatusIdLast: DO_SORTATION_STATUS.FINISHED,
  //         userIdUpdated: authMeta.userId,
  //         updatedTime: timeNow,
  //       });
  //       await transaction.update(DoSortationDetail, {
  //         doSortationId: findDoSortation.doSortationId,
  //       }, {
  //         doSortationStatusIdLast: DO_SORTATION_STATUS.FINISHED,
  //         userIdUpdated: authMeta.userId,
  //         updatedTime: timeNow,
  //         arrivalDateTime: timeNow,
  //       });
  //
  //       await MobileSortationService.createDoSortationHistory(
  //         transaction,
  //         findDoSortation.doSortationId,
  //         null,
  //         findDoSortation.doSortationTime,
  //         findDoSortation.doSortationVehicleIdLast,
  //         DO_SORTATION_STATUS.FINISHED,
  //         findDoSortation.branchIdFrom,
  //         null,
  //         null,
  //         authMeta.userId,
  //       );
  //
  //       // insert to history sortation finish
  //       const objSortationHistory = SortationFinishHistory.create({
  //         doSortationId : findDoSortation.doSortationId ,
  //         createdTime : timeNow,
  //         updatedTime : timeNow,
  //         userIdCreated : authMeta.userId,
  //         userIdUpdated : authMeta.userId,
  //       });
  //       await transaction.insert(SortationFinishHistory, objSortationHistory);
  //     });
  //
  //     const resultData = [];
  //     resultData.push({
  //       doSortationId: findDoSortation.doSortationId,
  //       doSortationCode: findDoSortation.doSortationCode,
  //     });
  //     const result = new SortationL2ModuleSearchResponseVm();
  //     result.statusCode = HttpStatus.OK;
  //     result.message = 'Success finish manual sortation';
  //     result.data = resultData;
  //     return result;
  //   } else {
  //     throw new BadRequestException(`DO SORTATION CODE : ` + payload.doSortationCode + `TIDAK DI TEMUKAN`);
  //   }
  // }
  //
  // public static async searchSortation(payload: SortationL2ModuleSearchPayloadVm) {
  //   const searchEmployee = await Employee.findOne({
  //     select: ['employeeId'],
  //     where: {
  //       nik: payload.nik,
  //     },
  //   });
  //   if (searchEmployee) {
  //     const qb = createQueryBuilder();
  //     qb.addSelect('ds.do_sortation_code', 'doSortationCode');
  //     qb.from('do_sortation', 'ds');
  //     qb.innerJoin(
  //       'do_sortation_vehicle',
  //       'dsv',
  //       `ds.do_sortation_vehicle_id_last = dsv.do_sortation_vehicle_id  and dsv.is_deleted = false and dsv.employee_driver_id = ${searchEmployee.employeeId}`,
  //     );
  //     qb.andWhere(`ds.do_sortation_status_id_last <> ${DO_SORTATION_STATUS.FINISHED}`);
  //     qb.andWhere('ds.is_deleted = false');
  //     const data = await qb.getRawMany();
  //     const resultData = [];
  //     data.forEach(element => {
  //       if (!resultData.includes(element.doSortationCode)) {
  //         resultData.push(element.doSortationCode);
  //       }
  //     });
  //     const result = new SortationL2ModuleSearchResponseVm();
  //     result.statusCode = HttpStatus.OK;
  //     result.message = 'Success search sortation code';
  //     result.data = resultData;
  //     return result;
  //   } else {
  //     throw new BadRequestException(`Employee with nik : ` + payload.nik + ` Not Found`);
  //   }
  // }

  public static async handoverModuleSortation(payload: SortationL2ModuleHandoverPayloadVm): Promise<SortationHandoverResponseVm> {
    const authMeta = AuthService.getAuthData();
    const permissionPayload = AuthService.getPermissionTokenPayload();
    const timeNow = moment().toDate();
    const result = new SortationHandoverResponseVm();
    const data = [];

    /** search do_sortation not finish */
    const resultDoSortation = await DoSortation.findOne({
      where: {
        doSortationCode : payload.doSortationCode,
        isDeleted : false,
        doSortationStatusIdLast: Not(DO_SORTATION_STATUS.FINISHED),
      },
    });

    if (resultDoSortation) {
      const RawQuery = `SELECT
        do_sortation_vehicle_id,
        employee_driver_id
      FROM
        do_sortation_vehicle dsv
      INNER JOIN do_sortation ds ON ds.do_sortation_id = dsv.do_sortation_id AND ds.is_deleted = FALSE AND ds.do_sortation_status_id_last <> ${DO_SORTATION_STATUS.FINISHED}
      WHERE
        dsv.do_sortation_vehicle_id = '${
          resultDoSortation.doSortationVehicleIdLast
        }'
        AND dsv.is_active = TRUE
        AND dsv.is_deleted = FALSE; `;

      const resulDoSortationVechile = await RawQueryService.query(RawQuery);
      if (resulDoSortationVechile.length > 0) {
        if (resulDoSortationVechile[0].employee_driver_id != payload.employeeIdDriver) {

          const resultAllDriverVehicle = await this.findAllActiveVehicleInDriver(
            resulDoSortationVechile[0].employee_driver_id, payload.doSortationCode,
          );
          const arrSmd = [];
          const vehicleId = [];
          for (const item of resultAllDriverVehicle) {
            vehicleId.push(item.do_sortation_vehicle_id);
          }

          const dataDoSortation = await DoSortation.find({
            where: {
              doSortationVehicleIdLast: In(vehicleId),
              doSortationStatusIdLast: Not(DO_SORTATION_STATUS.FINISHED),
              isDeleted: false,
            },
          });

          const dataSortationVehicle = await DoSortationVehicle.findOne({
            where : {doSortationVehicleId : resultDoSortation.doSortationVehicleIdLast},
          });
          const vehicleSeqRunning = dataSortationVehicle.vehicleSeq + 1;

          await getManager().transaction(async transaction => {
            for (const item of dataDoSortation) {
              /* Set Active False yang lama */
              await transaction.update(
                DoSortationVehicle,
                {
                  doSortationVehicleId : item.doSortationVehicleIdLast,
                },
                {
                  isActive: false,
                  userIdUpdated: authMeta.userId,
                  updatedTime: timeNow,
                });

              /* Create Vehicle Dulu dan jangan update ke do_sortation*/
              const paramDoSortationVehicleId = await SortationService.createDoSortationVehicle(
                item.doSortationId,
                null,
                payload.vehicleNumber,
                vehicleSeqRunning,
                payload.employeeIdDriver,
                permissionPayload.branchId,
                authMeta.userId,
              );

              await SortationService.createDoSortationHistory(
                item.doSortationId,
                null,
                paramDoSortationVehicleId,
                item.doSortationTime,
                permissionPayload.branchId,
                DO_SORTATION_STATUS.BACKUP_PROCESS,
                null,
                authMeta.userId,
              );

              await transaction.update(DoSortation,
                {
                  doSortationId : item.doSortationId,
                },
                {
                  doSortationStatusIdLast : DO_SORTATION_STATUS.BACKUP_PROCESS,
                  updatedTime : timeNow,
                  userIdUpdated : authMeta.userId,
                  doSortationVehicleIdLast : paramDoSortationVehicleId,
                },
              );

              await DoSortationDetail.update(
                {
                  doSortationId: item.doSortationId,
                  arrivalDateTime: null,
                },
                {
                  doSortationStatusIdLast: DO_SORTATION_STATUS.BACKUP_PROCESS,
                  userIdUpdated: authMeta.userId,
                  updatedTime: timeNow,
                },
              );

              data.push({
                doSortationId: item.doSortationId,
                doSortationCode: item.doSortationCode,
                doSortationVehicleId: paramDoSortationVehicleId,
              });
              arrSmd.push(item.doSortationCode);
            }

          });

          result.statusCode = HttpStatus.OK;
          result.message = 'Nomor Sortation ' + arrSmd.join(',') + ' berhasil handover';
          result.data = data;
          return result;

        } else {
          throw new BadRequestException(
            `Tidak bisa handover ke driver yang sama.`,
          );
        }
      } else {
        throw new BadRequestException(`Status tidak dapat di proses pada Sortation: ` + resultDoSortation.doSortationCode);
      }
    } else {
      throw new BadRequestException(`Sortation Code ${payload.doSortationCode} tidak ditemukan!`);
    }
  }

  static async findAllActiveVehicleInDriver(
    employee_id_driver: number, do_sortation_code: string,
  ): Promise<any[]> {
    const rawQuery = `
        SELECT
          do_sortation_vehicle_id,
          employee_driver_id
        FROM
          do_sortation_vehicle dsv
        INNER JOIN do_sortation ds ON ds.do_sortation_id = dsv.do_sortation_id AND ds.is_deleted = FALSE AND ds.do_sortation_status_id_last <> ${DO_SORTATION_STATUS.FINISHED} AND ds.do_sortation_code = '${do_sortation_code}'
        WHERE
          dsv.employee_driver_id = ${employee_id_driver}
          AND dsv.is_active = TRUE
          AND dsv.is_deleted = FALSE; `;
    const resultDataDoSortationVehicle = await RawQueryService.query(rawQuery);
    return resultDataDoSortationVehicle;
  }

}
