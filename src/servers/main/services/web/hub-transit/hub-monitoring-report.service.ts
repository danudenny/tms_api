import { RawQueryService } from '../../../../../shared/services/raw-query.service';
import moment = require('moment');
import express = require('express');
import fs = require('fs');
import { BaseMetaPayloadVm } from '../../../../../shared/models/base-meta-payload.vm';
import { RedisService } from '../../../../../shared/services/redis.service';
import { RequestErrorService } from '../../../../../shared/services/request-error.service';
import { HubMonitoringExcelStoreResponseVm } from '../../../models/hub-monitoring-report.response.vm';
import { HttpStatus } from '@nestjs/common';
import { HubMonitoringExcelExecutePayloadVm } from '../../../models/hub-monitoring-report.payload.vm';
import { HubMonitoringService } from './hub-monitoring.service';

export class HubMonitoringReportService {
  constructor() {}

  /**
   * Monitoring Delivery Bag - HUB
   */
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

  static async storeHubMonitoringPayload(
    payload: any,
  ): Promise<HubMonitoringExcelStoreResponseVm> {
    console.log(payload);
    const result = new HubMonitoringExcelStoreResponseVm();
    result.id = await this.storePayload(
      payload,
      'hub-monitoring',
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

  static async generateHubMonitoringCSV(
    res: express.Response,
    queryParams: HubMonitoringExcelExecutePayloadVm,
  ): Promise<any> {
    console.log(queryParams);
    const payload = await this.retrieveGenericData<any>(
      'hub-monitoring',
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
    p.page = 1;

    const data = await this.getDataCsvHubMonitoring(p);

    const fileName = 'data_' + moment().format('YYMMDD_HHmmss') + '.csv';

    await this.generateCSV(res, data, fileName);
  }

  static async getDataCsvHubMonitoring(payload: BaseMetaPayloadVm): Promise<any> {
    let query = await HubMonitoringService.getQueryMonitoringHubBagByFilterOrion(payload);
    query = query.split('"doPodDateTime"').join('"Tanggal"');
    query = query.split('"origin"').join('"Origin"');
    query = query.split('"status"').join('"Status"');
    query = query.split('"totalBag"').join('"Total Gabung Paket"');
    query = query.split('"totalAwb"').join('"Total Resi"');
    query = query.split('"totalScanIn"').join('"Scan In Gabung Paket"');
    query = query.split('"remaining"').join('"Sisa Gabung Paket"');
    query = query.split('"totalScanOut"').join('"Scan Out Gabung Paket"');

    const data = await RawQueryService.query(query);

    return data;
  }
}
