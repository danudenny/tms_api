import moment = require('moment');
import express = require('express');
import { HttpStatus } from '@nestjs/common';
import { CsvHelper } from '../../../../shared/helpers/csv-helpers';
import { HubMonitoringExcelStoreResponseVm } from '../../../main/models/hub-monitoring-report.response.vm';
import { HubMonitoringExcelExecutePayloadVm } from '../../../main/models/hub-monitoring-report.payload.vm';
import { RequestErrorService } from '../../../../shared/services/request-error.service';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { HubMonitoringService } from '../../../main/services/web/hub-transit/hub-monitoring.service';
import { RawQueryService } from '../../../../shared/services/raw-query.service';

export class HubMonitoringReportService {
  constructor() {}

  /**
   * Monitoring Delivery Bag - HUB
   */

  static async storeHubMonitoringPayload(
    payload: any,
  ): Promise<HubMonitoringExcelStoreResponseVm> {
    const result = new HubMonitoringExcelStoreResponseVm();
    result.id = await CsvHelper.storePayload(
      payload,
      'hub-monitoring',
    );
    return result;
  }

  static async generateHubMonitoringCSV(
    res: express.Response,
    queryParams: HubMonitoringExcelExecutePayloadVm,
  ): Promise<any> {
    const payload = await CsvHelper.retrieveGenericData<any>(
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
    p.limit = null;
    p.page = null;

    const data = await this.getDataCsvHubMonitoring(p);

    const fileName = 'data_' + moment().format('YYMMDD_HHmmss') + '.csv';

    await CsvHelper.generateCSV(res, data, fileName);
  }

  static async generateHubMonitoringSortirCSV(
    res: express.Response,
    queryParams: HubMonitoringExcelExecutePayloadVm,
  ): Promise<any> {
    const payload = await CsvHelper.retrieveGenericData<any>(
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

    const data = await this.getDataCsvHubMonitoringSortir(p);

    const fileName = 'data_' + moment().format('YYMMDD_HHmmss') + '.csv';

    await CsvHelper.generateCSV(res, data, fileName);
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

  static async getDataCsvHubMonitoringSortir(payload: BaseMetaPayloadVm): Promise<any> {
    const query = await HubMonitoringService.getQueryCSVMonitoringSortirByFilterOrion(payload);
    const data = await RawQueryService.query(query);
    if (data.length) {
      RequestErrorService.throwObj(
        {
          message: 'Data Monitoring Sortir Not Found!',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    return data;
  }
}
