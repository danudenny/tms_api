import moment = require('moment');
import express = require('express');
import fs = require('fs');
import { HttpStatus, Injectable } from '@nestjs/common';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { KorwilTransaction } from '../../../../shared/orm-entity/korwil-transaction';
import { RequestErrorService } from '../../../../shared/services/request-error.service';
import { RedisService } from '../../../../shared/services/redis.service';
import { MonitoringCoordinatorExcelExecuteResponseVm, WebMonitoringCoordinatorTaskReportResponse, WebMonitoringCoordinatorPhotoResponse } from '../../../main/models/web-monitoring-coordinator.response.vm';
import { MonitoringCoordinatorExcelExecutePayloadVm, WebMonitoringCoordinatorTaskPayload, WebMonitoringCoordinatorPhotoPayload } from '../../../main/models/web-monitoring-coordinator-payload.vm';
import { CsvHelper } from '../../../../shared/helpers/csv-helpers';
import { createQueryBuilder } from 'typeorm';
import { PdfHelper } from '../../../../shared/helpers/pdf-helpers';
import { MobileKorwilService } from '../../../main/services/mobile/mobile-korwil.service';

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

  static async storeMonitoringHrdPayload(
    payload: any,
  ): Promise<MonitoringCoordinatorExcelExecuteResponseVm> {
    const result = this.storeMonitoringPayload(payload);
    return result;
  }

  static async generateMonitoringKorwilCSV(
    res: express.Response,
    queryParams: MonitoringCoordinatorExcelExecutePayloadVm,
    isKorwilHrd: boolean = false,
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

    const data = await this.getDataCsvMonitoringKorwil(p, isKorwilHrd);

    const fileName = 'data_' + moment().format('YYMMDD_HHmmss') + '.csv';

    await CsvHelper.generateCSV(res, data, fileName);
  }

  static async generateMonitoringKorwilHrdCSV(
    res: express.Response,
    queryParams: MonitoringCoordinatorExcelExecutePayloadVm,
  ): Promise<any> {
    const result = await this.generateMonitoringKorwilCSV(res, queryParams, true);
    return result;
  }

  static async getDataCsvMonitoringKorwil(payload: BaseMetaPayloadVm, isKorwilHrd: boolean = false): Promise<any> {
    const operatorQueryHrdKorwil = isKorwilHrd ? '=' : '<>';
    const korwilConfig = await MobileKorwilService.getKorwilConfig();

    // mapping field
    payload.fieldResolverMap['date'] = 'a.date';
    payload.fieldResolverMap['userId'] = 'b.ref_user_id';
    payload.fieldResolverMap['checkInDatetime'] = '"Check In"';
    payload.fieldResolverMap['checkOutDatetime'] = '"Check Out"';
    payload.fieldResolverMap['branchId'] = 'a.branch_id';
    payload.fieldResolverMap['coordinatorName'] = '"Nama Karyawan"';
    payload.fieldResolverMap['representativeId'] = 'f.representative_id';
    payload.fieldResolverMap['representativeCode'] = 'f.representative_code';
    payload.fieldResolverMap['position'] = 'b.position';

    const repo = new OrionRepositoryService(KorwilTransaction, 'a');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q);

    q.selectRaw(
      [`CONCAT(c.first_name, ' ', c.last_name)`, 'Nama Karyawan'],
      [`COUNT(DISTINCT a.branch_id)`, 'Jumlah Gerai'],
      [`COUNT(DISTINCT a.korwil_transaction_id) FILTER (WHERE a.employee_journey_id IS NOT NULL)`, 'Jumlah Kunjungan'],
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
    q.innerJoin(e => e.users, 'g', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.users.roles, 'h', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.andWhereRaw(`h.role_id ${operatorQueryHrdKorwil} ${korwilConfig.korwilHrdRoleId}`);

    q.groupByRaw(`b.ref_user_id, "Nama Karyawan" ${isKorwilHrd ? '' : ', b.position'}`);
    q.orderByRaw('"Check In"', 'ASC');
    const data = await q.exec();

    return data;
  }

  static async generateMonitoringBranchCSV(
    res: express.Response,
    queryParams: MonitoringCoordinatorExcelExecutePayloadVm,
    isKorwilHrd: boolean = false,
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

    const data = await this.getDataCsvMonitoringBranch(p, isKorwilHrd);

    const fileName = 'data_' + moment().format('YYMMDD_HHmmss') + '.csv';

    await CsvHelper.generateCSV(res, data, fileName);
  }

  static async generateMonitoringBranchHrdCSV(
    res: express.Response,
    queryParams: MonitoringCoordinatorExcelExecutePayloadVm,
  ): Promise<any> {
    const result = await this.generateMonitoringBranchCSV(res, queryParams, true);
    return result;
  }

  static async getDataCsvMonitoringBranch(payload: BaseMetaPayloadVm, isKorwilHrd: boolean = false): Promise<any> {
    const operatorQueryHrdKorwil = isKorwilHrd ? '=' : '<>';
    const korwilConfig = await MobileKorwilService.getKorwilConfig();

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
    q.innerJoin(e => e.users.roles, 't7', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.andWhereRaw(`t7.role_id ${operatorQueryHrdKorwil} ${korwilConfig.korwilHrdRoleId}`);
    q.groupByRaw(`
      t2.branch_id,
      t2.branch_name,
      t1.total_task,
      t4.check_in_date,
      t4.check_out_date,
      t1.date,
      t1.korwil_transaction_id,
      t1.user_id,
      t1.status
    `);
    const data = await q.exec();

    return data;
  }

  static async generateMonitoringBranchPDF(
    payload: WebMonitoringCoordinatorTaskPayload,
    res: express.Response,
  ) {
    const dataPDF = await this.taskReport(payload);
    const fileName = 'korwil_' + moment().format('YYMMDD_HHmmss') + '.pdf';

    return PdfHelper.responseForJsReportPDF(
      res,
      {
        template: {
          shortid: 'rJl2awCzmI', // template-jsreport: korwil-report
        },
        data: dataPDF,
      },
      fileName,
      'korwil_monitoring.pdf',
    );
  }

  static async taskReport(
    payload: WebMonitoringCoordinatorTaskPayload,
  ): Promise<WebMonitoringCoordinatorTaskReportResponse> {
    const result = new WebMonitoringCoordinatorTaskReportResponse();
    const qb = createQueryBuilder();
    qb.addSelect('d.representative_name', 'representative');
    qb.addSelect('d.representative_code', 'representativeCode');
    qb.addSelect('a.date', 'date');
    qb.addSelect('c.branch_name', 'branchName');
    qb.addSelect('e.check_in_date', 'checkInDatetime');
    qb.addSelect('e.check_out_date', 'checkOutDatetime');
    qb.addSelect(`COUNT(f.is_done = true OR NULL)`, 'countChecklist');
    qb.addFrom('korwil_transaction', 'a');
    qb.innerJoin(
      'user_to_branch',
      'b',
      'b.user_to_branch_id = a.user_to_branch_id AND b.is_deleted = false',
    );
    qb.innerJoin(
      'branch',
      'c',
      'c.branch_id = b.ref_branch_id AND c.is_deleted = false',
    );
    qb.innerJoin(
      'representative',
      'd',
      'd.representative_id = c.representative_id AND d.is_deleted = false',
    );
    qb.innerJoin(
      'employee_journey',
      'e',
      'e.employee_journey_id = a.employee_journey_id AND e.is_deleted = false',
    );
    qb.innerJoin(
      'korwil_transaction_detail',
      'f',
      'f.korwil_transaction_id = a.korwil_transaction_id AND f.is_deleted = false',
    );
    qb.where('a.is_deleted = false');
    qb.andWhere('a.korwil_transaction_id = :korwilTransactionId', {
      korwilTransactionId: payload.korwilTransactionId,
    });
    qb.groupBy(
      ' a.korwil_transaction_id, d.representative_name, a.date, c.branch_name, e.check_in_date, e.check_out_date, d.representative_code',
    );

    const taskHeader = await qb.getRawOne();
    if (taskHeader) {
      result.transactionHeader = taskHeader;
      result.transactionHeader.checkInDatetime = await moment(taskHeader.checkInDatetime).format('YYYY-MM-DD');
      result.transactionHeader.checkOutDatetime = await moment(taskHeader.checkOutDatetime).format('YYYY-MM-DD');
      result.transactionHeader.date = await moment(taskHeader.date).format('YYYY-MM-DD');
      const qbDetail = createQueryBuilder();
      qbDetail.addSelect(
        'a.korwil_transaction_detail_id',
        'korwilTransactionDetailId',
      );
      qbDetail.addSelect('b.korwil_item_name', 'task');
      qbDetail.addSelect('a.note', 'note');
      qbDetail.addSelect('null', 'photo');
      qbDetail.addFrom('korwil_transaction_detail', 'a');
      qbDetail.innerJoin(
        'korwil_item',
        'b',
        'b.korwil_item_id = a.korwil_item_id AND b.is_deleted = false',
      );
      qbDetail.where('a.is_deleted = false');
      qbDetail.andWhere('a.is_done = true');
      qbDetail.andWhere('a.korwil_transaction_id = :korwilTransactioId', {
        korwilTransactioId: payload.korwilTransactionId,
      });
      const taskDetail = await qbDetail.getRawMany();

      if (taskDetail) {
        for (const task of taskDetail) {
          const params = {
            korwilTransactionDetailId: task.korwilTransactionDetailId,
          };
          const photoUrl = await this.taskPhoto(params);
          task.photo = photoUrl.url;
        }
        result.transactionDetail = taskDetail;
      }
    }
    return result;
  }

  static async taskPhoto(
    payload: WebMonitoringCoordinatorPhotoPayload,
  ): Promise<WebMonitoringCoordinatorPhotoResponse> {
    const result = new WebMonitoringCoordinatorPhotoResponse();
    const url = [];
    const qb = createQueryBuilder();
    qb.addSelect('url');
    qb.addFrom('korwil_transaction_detail_photo', 'a');
    qb.innerJoin(
      'attachment_tms',
      'b',
      'a.photo_id = b.attachment_tms_id AND b.is_deleted = false',
    );
    qb.where('a.is_deleted = false');
    qb.andWhere('a.korwil_transaction_detail_id = :korwilTransactionDetailId', {
      korwilTransactionDetailId: payload.korwilTransactionDetailId,
    });
    const data = await qb.getRawMany();
    for (const dataDetail of data) {
      url.push({ url: dataDetail.url });
    }
    result.url = url;
    return result;
  }
}
