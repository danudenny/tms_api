// #region import
import { Injectable, HttpStatus } from '@nestjs/common';
import moment = require('moment');
import express = require('express');

import { POD_TYPE } from '../../../../shared/constants/pod-type.constant';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { DoPod } from '../../../../shared/orm-entity/do-pod';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { RedisService } from '../../../../shared/services/redis.service';
import {
  WebScanOutReportVm,
} from '../../models/web-scan-out-response.vm';
import {RequestErrorService} from '../../../../shared/services/request-error.service';
import {CsvHelper} from '../../../../shared/helpers/csv-helpers';
import {DoPodDeliver} from '../../../../shared/orm-entity/do-pod-deliver';
// #endregion

@Injectable()
export class WebDeliveryOutReportService {

  constructor() {}
  static async retrieveGenericData<T = any>(
    prefix: string,
    identifier: string | number,
  ) {
    return RedisService.get<T>(`export-${prefix}-${identifier}`, true);
  }

  static async storeExcelPayload(
    payload: any,
  ): Promise<WebScanOutReportVm> {
    const result = new WebScanOutReportVm();
    result.id = await CsvHelper.storePayload(
      payload,
      'delivery-out',
    );
    return result;
  }

  static async generateScanOutDeliveryCSV(
    res: express.Response,
    queryParams: WebScanOutReportVm,
    isHub = false,
    isHubTransit = false,
  ): Promise<any> {
    const payload = await this.retrieveGenericData<any>(
      'delivery-out',
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
    p.sortBy = payload.sortBy;
    p.sortDir = payload.sortDir;
    p.limit = 100000000;

    const data = await this.getDataCsvDeliveryOut(p, isHub, isHubTransit);

    const fileName = 'data_' + moment().format('YYMMDD_HHmmss') + '.csv';

    await CsvHelper.generateCSV(res, data, fileName);
  }

  static async generateScanOutDeliveryTransitCSV(
    res: express.Response,
    queryParams: WebScanOutReportVm,
  ): Promise<any> {
    const payload = await this.retrieveGenericData<any>(
      'delivery-out',
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
    p.sortBy = payload.sortBy;
    p.sortDir = payload.sortDir;
    p.limit = 100000000;

    const data = await this.getDataCsvScanOutTransit(p);

    const fileName = 'data_' + moment().format('YYMMDD_HHmmss') + '.csv';

    await CsvHelper.generateCSV(res, data, fileName);
  }

  static async generateScanOutDeliveryDeliverCSV(
    res: express.Response,
    queryParams: WebScanOutReportVm,
  ): Promise<any> {
    const payload = await this.retrieveGenericData<any>(
      'delivery-out',
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
    p.sortBy = payload.sortBy;
    p.sortDir = payload.sortDir;
    p.limit = 100000000;

    const data = await this.getDataCsvScanOutDeliver(p);

    const fileName = 'data_' + moment().format('YYMMDD_HHmmss') + '.csv';

    await CsvHelper.generateCSV(res, data, fileName);
  }

  static async getDataCsvDeliveryOut(
    payload: BaseMetaPayloadVm,
    isHub = false,
    isHubTransit = false,
  ): Promise<any> {
    // mapping field
    payload.fieldResolverMap['doPodDateTime'] = 't1.do_pod_date_time';
    payload.fieldResolverMap['branchFrom'] = 't1.branch_id';
    payload.fieldResolverMap['branchTo'] = 't1.branch_id_to';
    payload.fieldResolverMap['doPodCode'] = 't1.do_pod_code';
    payload.fieldResolverMap['description'] = 't1.description';
    payload.fieldResolverMap['nickname'] = 't2.nickname';
    if (payload.sortBy === '') {
      payload.sortBy = 'doPodDateTime';
    }

    // mapping search field and operator default ilike
    payload.globalSearchFields = [
      {
        field: 'doPodDateTime',
      },
      {
        field: 'doPodCode',
      },
      {
        field: 'description',
      },
      {
        field: 'nickname',
      },
    ];

    const repo = new OrionRepositoryService(DoPod, 't1');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['t1.do_pod_code', 'No Surat Jalan'],
      ['TO_CHAR(t1.do_pod_date_time, \'DD Mon YYYY HH24:MI\')', 'Tgl Pengiriman'],
      ['t6.branch_name', 'Gerai Asal'],
      ['t3.branch_name', 'Gerai Tujuan'],
      ['t2.fullname', 'Sigesit/Driver'],
      ['t2.nik', 'NIK Driver'],
      ['t1.vehicle_number', 'NO Mobil'],
      ['t1.last_date_scan_out', 'Terakhir Sc.Keluar'],
      ['t1.last_date_scan_in', 'Terakhir Sc.Masuk'],
      ['COUNT(t5.bag_item_id)', 'Gabung Paket'],
      ['"t1"."description"', 'Keterangan'],
    );
    // TODO: relation userDriver to Employee Driver
    q.innerJoin(e => e.doPodDetailBag, 't5', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.userDriver.employee, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.branchTo, 't3', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.leftJoin(e => e.attachment, 't4', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.branch, 't6', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()));

    if (isHub) {
      q.andWhere(e => e.doPodType, w => w.equals(POD_TYPE.OUT_HUB));
    } else if (isHubTransit) {
      q.andWhere(e => e.doPodType, w => w.equals(POD_TYPE.OUT_HUB_TRANSIT));
    } else {
      q.andWhere(e => e.doPodType, w => w.equals(POD_TYPE.OUT_BRANCH));
    }
    q.groupByRaw('t1.do_pod_id, t2.employee_id, t3.branch_name, t4.url, t6.branch_name, t6.branch_id');

    const data = await q.exec();
    return data;
  }

  static async getDataCsvScanOutTransit(
    payload: BaseMetaPayloadVm,
  ): Promise<any> {
    // mapping field
    payload.fieldResolverMap['doPodDateTime'] = 't1.do_pod_date_time';
    payload.fieldResolverMap['branchFrom'] = 't1.branch_id';
    payload.fieldResolverMap['branchTo'] = 't1.branch_id_to';
    payload.fieldResolverMap['branchId'] = 't1.branch_id';
    payload.fieldResolverMap['doPodCode'] = 't1.do_pod_code';
    payload.fieldResolverMap['userIdDriver'] = 't1.user_id_driver';
    payload.fieldResolverMap['description'] = 't1.description';
    payload.fieldResolverMap['createdTime'] = 't1.created_time';
    payload.fieldResolverMap['totalAwb'] = 'totalAwb';
    payload.fieldResolverMap['employeeName'] = 't2.fullname';
    payload.fieldResolverMap['branchName'] = 't3.branch_name';
    payload.fieldResolverMap['awbNumber'] = 't4.awb_number';
    payload.fieldResolverMap['partnerLogisticName'] = `"partnerLogisticName"`;
    if (payload.sortBy === '') {
      payload.sortBy = 'doPodDateTime';
    }

    // mapping search field and operator default ilike
    payload.globalSearchFields = [
      {
        field: 'doPodDateTime',
      },
      {
        field: 'doPodCode',
      },
      {
        field: 'branchName',
      },
      {
        field: 'fullname',
      },
    ];

    const repo = new OrionRepositoryService(DoPod, 't1');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['t1.do_pod_code', 'Nomor Surat Jalan'],
      ['TO_CHAR(t1.do_pod_date_time, \'DD Mon YYYY HH24:MI\')', 'Tanggal Pengiriman'],
      [`
        CASE
          WHEN t1.partner_logistic_name IS NOT NULL THEN t1.partner_logistic_name
          WHEN t1.partner_logistic_id IS NOT NULL AND t1.partner_logistic_name IS NULL THEN t5.partner_logistic_name
          ELSE
            'Internal'
        END
      `, 'Jenis Surat Jalan'],
      ['t2.fullname', 'Sigesit/Driver'],
      ['t2.nik', 'NIK Driver'],
      ['t1.vehicle_number', 'NO Mobil'],
      ['t6.branch_name', 'Gerai Asal'],
      ['t3.branch_name', 'Gerai Tujuan'],
      ['COUNT (t4.do_pod_id)', 'Total Resi'],
      ['"t1"."description"', 'Keterangan'],
    );

    q.innerJoin(e => e.doPodDetails, 't4', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.branchTo, 't3', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.branch, 't6', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.leftJoin(e => e.userDriver.employee, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.leftJoin(e => e.partnerLogistic, 't5', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.andWhere(e => e.doPodType, w => w.equals(POD_TYPE.OUT_BRANCH_AWB));
    q.andWhere(e => e.totalScanOutAwb, w => w.greaterThan(0));

    q.groupByRaw('t1.do_pod_id, t1.created_time,t1.do_pod_code,t1.do_pod_date_time,t1.description,t2.fullname,t3.branch_name, t5.partner_logistic_name, t2.nik, t6.branch_id, t6.branch_name');
    const data = await q.exec();
    return data;
  }

  static async getDataCsvScanOutDeliver(
    payload: BaseMetaPayloadVm,
  ): Promise<any> {
    // mapping field
    payload.fieldResolverMap['doPodDeliverDateTime'] =
      't1.do_pod_deliver_date_time';
    payload.fieldResolverMap['datePOD'] = 'Tanggal Pengiriman';
    payload.fieldResolverMap['branchFrom'] = 't1.branch_id';
    payload.fieldResolverMap['branchName'] = 't5.branch_name';
    payload.fieldResolverMap['userIdDriver'] = 't1.user_id_driver';
    payload.fieldResolverMap['doPodDeliverCode'] = 't1.do_pod_deliver_code';
    payload.fieldResolverMap['totalSuratJalan'] = 'totalSuratJalan';
    payload.fieldResolverMap['totalAwb'] = 'totalAwb';
    payload.fieldResolverMap['totalAntar'] = 'totalAntar';
    payload.fieldResolverMap['totalDelivery'] = 'totalDelivery';
    payload.fieldResolverMap['totalProblem'] = 'totalProblem';

    // payload.fieldResolverMap['totalAssigned'] = 't4.awb_number';
    if (!payload.sortBy) {
      payload.sortBy = 'doPodDeliverDateTime';
    }

    const repo = new OrionRepositoryService(DoPodDeliver, 't1');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['t2.fullname', 'Sigesit/Driver'],
      ['TO_CHAR(t1.do_pod_deliver_date_time, \'DD Mon YYYY\')', 'Tanggal Pengiriman'],
      ['t5.branch_name', 'Gerai'],
      ['COUNT(DISTINCT(t1.do_pod_deliver_id))', 'Total Surat Jalan'],
      ['COUNT(t3.awb_number)', 'Total Assigned'],
      [
        'COUNT(t3.awb_number) FILTER (WHERE t3.awb_status_id_last = 14000)',
        'On Process',
      ],
      [
        'COUNT(t3.awb_number) FILTER (WHERE t3.awb_status_id_last = 30000)',
        'Total Berhasil',
      ],
      [
        'COUNT(t3.awb_number) FILTER (WHERE t3.awb_status_id_last <> 30000 AND t3.awb_status_id_last <> 14000)',
        'Total Bermasalah',
      ],
    );

    q.innerJoin(e => e.userDriver.employee, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.doPodDeliverDetails, 't3', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.branch, 't5', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.groupByRaw(
      't1.do_pod_deliver_date_time, t1.user_id_driver, t1.branch_id, t2.fullname, t5.branch_name',
    );

    const data = await q.exec();
    return data;
  }
}
