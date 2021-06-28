// #region import
import { Injectable, HttpStatus } from '@nestjs/common';
import moment = require('moment');
import express = require('express');

import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { RequestErrorService } from '../../../../shared/services/request-error.service';
import { DoSmdDetail } from '../../../../shared/orm-entity/do_smd_detail';
import { CsvHelper } from '../../../../shared/helpers/csv-helpers';
import { BagCityReportVm } from '../../../smd/models/bag-city-report.vm';
import {BagRepresentative} from '../../../../shared/orm-entity/bag-representative';

@Injectable()
export class SmdBagCityReportService {
  constructor() {}

  static async storeExcelPayload(
    payload: any,
  ): Promise<BagCityReportVm> {
    const result = new BagCityReportVm();
    result.id = await CsvHelper.storePayload(
      payload,
      'bag-city-smd-report',
    );
    return result;
  }

  static async generateBagCityCSV(
    res: express.Response,
    queryParams: BagCityReportVm,
  ): Promise<any> {
    const payload = await CsvHelper.retrieveGenericData<any>(
      'bag-city-smd-report',
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

    const data = await this.getDataCsvBagCitySmd(p);

    const fileName = 'data_' + moment().format('YYMMDD_HHmmss') + '.csv';

    await CsvHelper.generateCSV(res, data, fileName);
  }

  static async getDataCsvBagCitySmd(
    payload: BaseMetaPayloadVm,
  ): Promise<any> {

    // mapping search field and operator default ilike
    payload.globalSearchFields = [
      {
        field: 'representativeCode',
      },
      {
        field: 'bagRepresentativeCode',
      },
    ];
    payload.fieldResolverMap['bagRepresentativeCode'] = 't1.bag_representative_code';
    payload.fieldResolverMap['bagRepresentativeDate'] = 't1.bag_representative_date';
    payload.fieldResolverMap['representativeCode'] = 't2.representative_code';
    payload.fieldResolverMap['createdTime'] = 't1.created_time';
    payload.fieldResolverMap['branchId'] = 't1.branch_id';
    payload.fieldResolverMap['branchBagRepresentative'] = 't3.branch_name';
    const repo = new OrionRepositoryService(BagRepresentative, 't1');

    const q = repo.findAllRaw();
    payload.applyToOrionRepositoryQuery(q);

    q.selectRaw(
      ['t1.bag_representative_code', 'No Gabung Sortir Kota'],
      ['t2.representative_code', 'Kode Gerai'],
      ['t3.branch_name', 'Gerai'],
      ['TO_CHAR(t1.bag_representative_date, \'dd Mon YYYY HH24:MI:SS\')', 'Tgl Gab. Paket kota'],
      ['COUNT(t4.bag_representative_item_id)', 'Jumlah Resi'],
      ['CONCAT(CAST(t1.total_weight AS DECIMAL(18,2)), \' Kg\')', 'Total Berat'],
    );
    q.leftJoin(e => e.representative, 't2');
    q.innerJoin(e => e.branch, 't3', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.bagRepresentativeItems, 't4', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.groupByRaw(`
      t1.bag_representative_id,
      t1.bag_representative_code,
      t1.created_time,
      t1.bag_representative_date,
      t1.total_weight,
      t2.representative_code,
      t3.branch_name,
      t2.representative_name
    `);

    const data = await q.exec();
    return data;
  }
}
