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
  WebScanOutBranchReportVm,
} from '../../models/web-scan-out-response.vm';
import {RequestErrorService} from '../../../../shared/services/request-error.service';
import {CsvHelper} from '../../../../shared/helpers/csv-helpers';
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
  ): Promise<WebScanOutBranchReportVm> {
    const result = new WebScanOutBranchReportVm();
    result.id = await CsvHelper.storePayload(
      payload,
      'delivery-out',
    );
    return result;
  }

  static async generateScanOutDeliveryCSV(
    res: express.Response,
    queryParams: WebScanOutBranchReportVm,
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
    p.limit = 100000000;

    const data = await this.getDataCsvDeliveryOut(p, isHub, isHubTransit);

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
      ['t1.do_pod_date_time', 'Tgl Pengiriman'],
      ['t1.branch_id_to', 'Gerai Tujuan'],
      ['t2.fullname', 'Sigesit/Driver'],
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

    if (isHub) {
      q.andWhere(e => e.doPodType, w => w.equals(POD_TYPE.OUT_HUB));
    } else if (isHubTransit) {
      q.andWhere(e => e.doPodType, w => w.equals(POD_TYPE.OUT_HUB_TRANSIT));
    } else {
      q.andWhere(e => e.doPodType, w => w.equals(POD_TYPE.OUT_BRANCH));
    }
    q.groupByRaw('t1.do_pod_id, t2.employee_id, t3.branch_name, t4.url');

    const data = await q.exec();
    return data;
  }
}
