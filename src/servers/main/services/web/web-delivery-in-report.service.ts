import moment = require('moment');
import express = require('express');
import fs = require('fs');
import { HttpStatus, Injectable } from '@nestjs/common';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { RequestErrorService } from '../../../../shared/services/request-error.service';
import { RedisService } from '../../../../shared/services/redis.service';
import { HubDeliveryInExcelExecuteVm } from '../../models/web-scanin.vm';
import { PodScanInHubDetail } from '../../../../shared/orm-entity/pod-scan-in-hub-detail';

@Injectable()
export class WebDeliveryInReportService {
  constructor() {}
  static async retrieveGenericData<T = any>(
    prefix: string,
    identifier: string | number,
  ) {
    return RedisService.get<T>(`export-${prefix}-${identifier}`, true);
  }

  static async storePayload(payloadBody: any, prefix: string): Promise<string> {
    if (!payloadBody) {
      RequestErrorService.throwObj({
        message: 'body cannot be null or undefined',
      });
    }
    const identifier = moment().format('YYMMDDHHmmss');
    // const authMeta = AuthService.getAuthData();
    RedisService.setex(
      `export-${prefix}-${identifier}`,
      payloadBody,
      10 * 60,
      true,
    );
    return identifier;
  }

  static async storeHubDeliveryInPayload(
    payload: any,
  ): Promise<HubDeliveryInExcelExecuteVm> {
    const result = new HubDeliveryInExcelExecuteVm();
    result.id = await this.storePayload(
      payload,
      'hub-delivery-in',
    );
    return result;
  }

  static async generateCSV(
    res: express.Response,
    data: any,
    fileName: string,
  ): Promise<any> {
    const fastcsv = require('fast-csv');

    // NOTE: create excel using unique name
    try {
      const ws = fs.createWriteStream(fileName);
      fastcsv.write(data, {headers: true}).pipe(ws);

      const filestream = fs.createReadStream(fileName);
      const mimeType = 'application/vnd.ms-excel';

      res.setHeader('Content-disposition', 'attachment; filename=' + fileName);
      res.setHeader('Content-type', mimeType);
      filestream.pipe(res);
    } catch (error) {
      RequestErrorService.throwObj(
        {
          message: `error ketika download excel Monitoring`,
        },
        HttpStatus.BAD_REQUEST,
      );
    } finally {
      // Delete temporary saved-file in server
      if (fs.existsSync(fileName)) {
        fs.unlinkSync(fileName);
      }
    }
  }

  static async generateHubDeliveryInCSV(
    res: express.Response,
    queryParams: HubDeliveryInExcelExecuteVm,
  ): Promise<any> {
    const payload = await this.retrieveGenericData<any>(
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
    p.limit = 10000;

    const data = await this.getDataCsvHubDeliveryIn(p);

    const fileName = 'data_' + moment().format('YYMMDD_HHmmss') + '.csv';

    await this.generateCSV(res, data, fileName);
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

    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['t3.awb_number', 'Resi'],
      ['t1.created_time', 'Tanggal Tiba'],
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
