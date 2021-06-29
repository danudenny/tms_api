// #region import
import { Injectable, HttpStatus } from '@nestjs/common';
import moment = require('moment');
import express = require('express');

import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { RequestErrorService } from '../../../../shared/services/request-error.service';
import { CsvHelper } from '../../../../shared/helpers/csv-helpers';
import { WebScanOutReportVm } from '../../../main/models/web-scan-out-response.vm';
import { BagRepresentativeTrackingDetailAwbVm } from '../../../smd/models/bag-representative-tracking-detail-awb.vm';
import { BagRepresentativeItem } from '../../../../shared/orm-entity/bag-representative-item';

@Injectable()
export class TrackingDeliveryOutService {
  constructor() {}

  static async storeExcelPayload(
    payload: BagRepresentativeTrackingDetailAwbVm,
  ): Promise<WebScanOutReportVm> {
    const result = new WebScanOutReportVm();
    result.id = await CsvHelper.storePayload(
      payload,
      'tracking-bag-representative-detail-report',
    );
    return result;
  }

  static async exportBagRepresentativeDetail(
    res: express.Response,
    queryParams: WebScanOutReportVm,
  ): Promise<any> {
    const payload = await CsvHelper.retrieveGenericData<BagRepresentativeTrackingDetailAwbVm>(
      'tracking-bag-representative-detail-report',
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

    const data = await this.getDataCsvtrackingBagRepresentative(payload);

    const fileName = 'data_' + moment().format('YYMMDD_HHmmss') + '.csv';

    await CsvHelper.generateCSV(res, data, fileName);
  }

  static async getDataCsvtrackingBagRepresentative(
    payload: BagRepresentativeTrackingDetailAwbVm,
  ): Promise<any> {
    const repo = new OrionRepositoryService(BagRepresentativeItem, 'bri');
    const q = repo.findAllRaw();

    q.selectRaw(
      ['CONCAT(\'="\',bri.ref_awb_number, \'"\')', 'No Resi'],
      ['CONCAT(awb.total_weight_final_rounded::numeric(10,2), \' Kg\')', 'Berat Asli'],
      ['pt.package_type_code', 'Layanan'],
    );
    q.innerJoin(e => e.awb, 'awb', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.awb.packageType, 'pt', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.andWhere(e => e.bagRepresentativeId, w => w.equals(payload.bagRepresentativeId));
    q.andWhere(e => e.isDeleted, w => w.isFalse());

    const data = await q.exec();

    return data;
  }
}
