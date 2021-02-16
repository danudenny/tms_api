import moment = require('moment');
import express = require('express');
import fs = require('fs');
import { HttpStatus, Injectable } from '@nestjs/common';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { RequestErrorService } from '../../../../shared/services/request-error.service';
import { PodScanInHubDetail } from '../../../../shared/orm-entity/pod-scan-in-hub-detail';
import { CsvHelper } from '../../../../shared/helpers/csv-helpers';
import {HubDeliveryInExcelExecuteVm} from '../../../main/models/web-scanin.vm';

@Injectable()
export class  ScaninWebDeliveryReportService {
  constructor() {}

  static async storeHubDeliveryInPayload(
    payload: any,
  ): Promise<HubDeliveryInExcelExecuteVm> {
    const result = new HubDeliveryInExcelExecuteVm();
    result.id = await CsvHelper.storePayload(
      payload,
      'hub-delivery-in',
    );
    return result;
  }

  static async generateHubDeliveryInCSV(
    res: express.Response,
    queryParams: HubDeliveryInExcelExecuteVm,
  ): Promise<any> {
    const payload = await CsvHelper.retrieveGenericData<any>(
      'hub-delivery-in',
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

    const data = await this.getDataCsvHubDeliveryIn(p);

    const fileName = 'data_' + moment().format('YYMMDD_HHmmss') + '.csv';

    await CsvHelper.generateCSV(res, data, fileName);
  }

  static async getDataCsvHubDeliveryIn(payload: BaseMetaPayloadVm): Promise<any> {
    // mapping field
    payload.fieldResolverMap['awbNumber'] = 't3.awb_number';
    payload.fieldResolverMap['branchScanId'] = 't4.branch_id';
    payload.fieldResolverMap['createdTime'] = 't1.created_time';
    payload.fieldResolverMap['dateScanIn'] = 't1.created_time';
    payload.fieldResolverMap['branchScanName'] = 't4.branch_name';
    if (payload.sortBy === '') {
      payload.sortBy = '"Tanggal Tiba"';
    }

    // mapping search field and operator default ilike
    payload.globalSearchFields = [
      {
        field: 'consigneeName',
      },
      {
        field: 'consigneeAddress',
      },
      {
        field: 'awbNumber',
      },
    ];

    const repo = new OrionRepositoryService(PodScanInHubDetail, 't1');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q);

    q.selectRaw(
      ['t3.awb_number', 'Resi'],
      ['TO_CHAR(t1.created_time, \'DD Mon YYYY HH24:MI\')', 'Tanggal Tiba'],
      ['t4.branch_name', 'Hub Scan'],
      ['t3.consignee_name', 'Penerima'],
      ['t3.consignee_address', 'Alamat Penerima'],
    );

    q.innerJoin(e => e.podScanInHub, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.awb, 't3', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.podScanInHub.branch, 't4', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    const data = await q.exec();
    return data;
  }
}
