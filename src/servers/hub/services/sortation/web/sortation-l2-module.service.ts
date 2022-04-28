import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import {
  SortationL2ModuleFinishManualPayloadVm,
  SortationL2ModuleSearchPayloadVm,
} from '../../../models/sortation/web/sortation-l2-module-search.payload.vm';
import { Employee } from '../../../../../shared/orm-entity/employee';
import { createQueryBuilder, getManager, Not } from 'typeorm';
import { DO_SORTATION_STATUS } from '../../../../../shared/constants/do-sortation-status.constant';
import { SortationL2ModuleSearchResponseVm } from '../../../models/sortation/web/sortation-l2-module-search.response.vm';
import { DoSortation } from '../../../../../shared/orm-entity/do-sortation';
import { AuthService } from '../../../../../shared/services/auth.service';
import moment = require('moment');
import { DoSortationDetail } from '../../../../../shared/orm-entity/do-sortation-detail';
import { MobileSortationService } from '../mobile/mobile-sortation.service';


@Injectable()
export class SortationL2ModuleService {
  public static async finishManualSortation(payload: SortationL2ModuleFinishManualPayloadVm) {
    const timeNow = moment().toDate();
    const authMeta = AuthService.getAuthData();

    const findDoSortation = await DoSortation.findOne({
      where: {
        doSortationCode: payload.doSortationCode,
        isDeleted: false,
        doSortationStatusIdLast: Not(DO_SORTATION_STATUS.FINISHED),
      },
    });

    if (findDoSortation) {
      await getManager().transaction(async transaction => {
        await transaction.update(DoSortation, {
          doSortationId: findDoSortation.doSortationId,
        }, {
          doSortationStatusIdLast: DO_SORTATION_STATUS.FINISHED,
          userIdUpdated: authMeta.userId,
          updatedTime: timeNow,
        });
        await transaction.update(DoSortationDetail, {
          doSortationId: findDoSortation.doSortationId,
        }, {
          doSortationStatusIdLast: DO_SORTATION_STATUS.FINISHED,
          userIdUpdated: authMeta.userId,
          updatedTime: timeNow,
          arrivalDateTime: moment().toDate(),
        });

        await MobileSortationService.createDoSortationHistory(
          transaction,
          findDoSortation.doSortationId,
          null,
          findDoSortation.doSortationTime,
          findDoSortation.doSortationVehicleIdLast,
          DO_SORTATION_STATUS.FINISHED,
          findDoSortation.branchIdFrom,
          null,
          null,
          null,
          authMeta.userId,
        );
      });

      const resultData = [];
      resultData.push({
        doSortationId: findDoSortation.doSortationId,
        doSortationCode: findDoSortation.doSortationCode,
      });
      const result = new SortationL2ModuleSearchResponseVm();
      result.statusCode = HttpStatus.OK;
      result.message = 'Success finish manual sortation';
      result.data = resultData;
      return result;
    } else {
      throw new BadRequestException(`Can't Find  DO SORTATION CODE : ` + payload.doSortationCode);
    }
  }

  public static async searchSortation(payload: SortationL2ModuleSearchPayloadVm) {
    const searchEmployee = await Employee.findOne({
      select: ['employeeId'],
      where: {
        nik: payload.nik,
      },
    });
    if (searchEmployee) {
      const qb = createQueryBuilder();
      qb.addSelect('ds.do_sortation_code', 'doSortationCode');
      qb.from('do_sortation', 'ds');
      qb.innerJoin(
        'do_sortation_detail',
        'dsd',
        `ds.do_sortation_id = dsd.do_sortation_id and dsd.is_deleted = false and dsd.do_sortation_status_id_last <> ${DO_SORTATION_STATUS.FINISHED}`,
      );
      qb.innerJoin(
        'do_sortation_vehicle',
        'dsv',
        `ds.do_sortation_vehicle_id_last = dsv.do_sortation_vehicle_id  and dsv.is_deleted = false and dsv.employee_driver_id = ${searchEmployee.employeeId}`,
      );
      qb.andWhere('ds.is_deleted = false');
      const data = await qb.getRawMany();
      const resultData = [];
      data.forEach(element => {
        resultData.push(element.doSortationCode);
      });
      const result = new SortationL2ModuleSearchResponseVm();
      result.statusCode = HttpStatus.OK;
      result.message = 'Success search sortation code';
      result.data = resultData;
      return result;
    } else {
      throw new BadRequestException(`Employee with nik : ` + payload.nik + ` Not Found`);
    }
  }
}
