import moment = require('moment');
import express = require('express');
import fs = require('fs');
import { HttpStatus, Injectable } from '@nestjs/common';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { KorwilTransaction } from '../../../../shared/orm-entity/korwil-transaction';
import { RequestErrorService } from '../../../../shared/services/request-error.service';
import { RedisService } from '../../../../shared/services/redis.service';
import { MonitoringCoordinatorExcelExecuteResponseVm } from '../../../main/models/web-monitoring-coordinator.response.vm';
import { MonitoringCoordinatorExcelExecutePayloadVm } from '../../../main/models/web-monitoring-coordinator-payload.vm';
import { CsvHelper } from '../../../../shared/helpers/csv-helpers';

@Injectable()
export class KorwilMonitoringCoordinatorReportService {
  constructor() {}
  static async retrieveGenericData<T = any>(
    prefix: string,
    identifier: string | number,
  ) {
    return RedisService.get<T>(`export-${prefix}-${identifier}`, true);
  }

  static async storeMonitoringPayload(
    payload: any,
  ): Promise<MonitoringCoordinatorExcelExecuteResponseVm> {
    const result = new MonitoringCoordinatorExcelExecuteResponseVm();
    result.id = await CsvHelper.storePayload(
      payload,
      'monitoring-coordinator',
    );
    return result;
  }

  static async generateMonitoringKorwilCSV(
    res: express.Response,
    queryParams: MonitoringCoordinatorExcelExecutePayloadVm,
  ): Promise<any> {
    const payload = await this.retrieveGenericData<any>(
      'monitoring-coordinator',
      queryParams.id,
    );
    if (!payload) {
      RequestErrorService.throwObj(
        {
          message: 'body cannot be null or undefined',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const p = new BaseMetaPayloadVm();
    p.filters = payload.filters ? payload.filters : payload;
    p.limit = null;

    const data = await this.getDataCsvMonitoringKorwil(p);

    const fileName = 'data_' + moment().format('YYMMDD_HHmmss') + '.csv';

    await CsvHelper.generateCSV(res, data, fileName);
  }

  static async getDataCsvMonitoringKorwil(payload: BaseMetaPayloadVm): Promise<any> {
    // mapping field
    payload.fieldResolverMap['date'] = 'a.date';
    payload.fieldResolverMap['userId'] = 'b.ref_user_id';
    payload.fieldResolverMap['checkInDatetime'] = '"Check In"';
    payload.fieldResolverMap['checkOutDatetime'] = '"Check Out"';
    payload.fieldResolverMap['branchId'] = 'a.branch_id';
    payload.fieldResolverMap['coordinatorName'] = '"Nama Karyawan"';
    payload.fieldResolverMap['representativeId'] = 'f.representative_id';
    payload.fieldResolverMap['representativeCode'] = 'f.representative_code';

    const repo = new OrionRepositoryService(KorwilTransaction, 'a');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q);

    q.selectRaw(
      [`CONCAT(c.first_name, ' ', c.last_name)`, 'Nama Karyawan'],
      [`COUNT(DISTINCT a.branch_id)`, 'Jumlah Gerai'],
      [`COUNT(*) FILTER (WHERE a.employee_journey_id IS NOT NULL)`, 'Jumlah Kunjungan'],
      [`TO_CHAR(MIN(d.check_in_date), \'DD Mon YYYY HH24:MI\')`, 'Check In'],
      [`TO_CHAR(MAX(d.check_out_date), \'DD Mon YYYY HH24:MI\')`, 'Check Out'],
    );
    q.innerJoin(e => e.userToBranch, 'b', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.users, 'c', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.leftJoin(e => e.employeeJourney, 'd', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.branches, 'e', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.branches.representative, 'f', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.groupByRaw('b.ref_user_id, "Nama Karyawan"');
    q.orderByRaw('"Check In"', 'ASC');
    const data = await q.exec();

    return data;
  }

  static async generateMonitoringBranchCSV(
    res: express.Response,
    queryParams: MonitoringCoordinatorExcelExecutePayloadVm,
  ): Promise<any> {
    const payload = await this.retrieveGenericData<any>(
      'monitoring-coordinator',
      queryParams.id,
    );

    if (!payload) {
      RequestErrorService.throwObj(
        {
          message: 'body cannot be null or undefined',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const p = new BaseMetaPayloadVm();
    p.filters = payload.filters ? payload.filters : payload;
    p.limit = null;

    const data = await this.getDataCsvMonitoringBranch(p);

    const fileName = 'data_' + moment().format('YYMMDD_HHmmss') + '.csv';

    await CsvHelper.generateCSV(res, data, fileName);
  }

  static async getDataCsvMonitoringBranch(payload: BaseMetaPayloadVm): Promise<any> {
    // mapping field
    payload.fieldResolverMap['countTask'] = 't1.total_task';
    payload.fieldResolverMap['branchId'] = 't2.branch_id';
    payload.fieldResolverMap['date'] = 't1.date';
    payload.fieldResolverMap['userId'] = 't1.user_id';
    payload.fieldResolverMap['coordinatorName'] = 'CONCAT(t5.first_name, \' \', t5.last_name)';
    payload.fieldResolverMap['employeeJourneyId'] = 't1.employee_journey_id';
    payload.fieldResolverMap['representativeId'] = 't6.representative_id';
    payload.fieldResolverMap['representativeCode'] = 't6.representative_code';

    const repo = new OrionRepositoryService(KorwilTransaction, 't1');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q);

    q.selectRaw(
      ['t2.branch_name', 'Gerai'],
      ['t1.total_task', 'Total Task'],
      [`COUNT(t3.is_done = true OR NULL)`, 'Jumlah Checklist'],
      [`TO_CHAR(t4.check_in_date, \'DD Mon YYYY HH24:MI\')`, 'Check In'],
      [`TO_CHAR(t4.check_out_date, \'DD Mon YYYY HH24:MI\')`, 'Check Out'],
      [`CASE
          WHEN t1.status = 0 THEN 'Belum Selesai'
          ELSE 'Sudah Selesai'
        END`, 'Status'],
    );
    q.innerJoin(e => e.branches, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.leftJoin(e => e.korwilTransactionDetail, 't3', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.leftJoin(e => e.employeeJourney, 't4', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.users, 't5', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.branches.representative, 't6', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.groupByRaw('t2.branch_id, t2.branch_name, t1.total_task, t4.check_in_date, t4.check_out_date, t1.date, t1.korwil_transaction_id, t1.user_id, t1.status');
    const data = await q.exec();

    return data;
  }
}
