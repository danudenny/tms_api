// #region import
import { Injectable, HttpStatus } from '@nestjs/common';
import moment = require('moment');
import express = require('express');
import fs = require('fs');

import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { RedisService } from '../../../../shared/services/redis.service';
import { RequestErrorService } from '../../../../shared/services/request-error.service';

import { DoSmd } from '../../../../shared/orm-entity/do_smd';
import { ScanOutVendorReportVm } from '../../models/scanout-smd-vendor.response.vm';
// #endregion

@Injectable()
export class ScanoutSmdVendorReportService {

  constructor() {}
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

  static async retrieveGenericData<T = any>(
    prefix: string,
    identifier: string | number,
  ) {
    return RedisService.get<T>(`export-${prefix}-${identifier}`, true);
  }

  static async storeExcelPayload(
    payload: any,
  ): Promise<ScanOutVendorReportVm> {
    const result = new ScanOutVendorReportVm();
    result.id = await this.storePayload(
      payload,
      'smd-vendor',
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

  static async generateVendorCSV(
    res: express.Response,
    queryParams: ScanOutVendorReportVm,
  ): Promise<any> {
    const payload = await this.retrieveGenericData<any>(
      'smd-vendor',
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

    const data = await this.getDataCsvVendor(p);

    const fileName = 'data_' + moment().format('YYMMDD_HHmmss') + '.csv';

    await this.generateCSV(res, data, fileName);
  }

  static async getDataCsvVendor(
    payload: BaseMetaPayloadVm,
  ): Promise<any> {

    // mapping search field and operator default ilike
    payload.fieldResolverMap['vendor_id'] = 't2.vendor_id';
    payload.fieldResolverMap['vendor_name'] = 't2.vendor_name';
    payload.fieldResolverMap['vendor_code'] = 't2.vendor_code';
    payload.fieldResolverMap['do_smd_id'] = 't1.do_smd_id';
    payload.fieldResolverMap['branch_id'] = 't4.branch_id';
    payload.fieldResolverMap['do_smd_code'] = 't1.do_smd_code';
    payload.fieldResolverMap['do_smd_time'] = 't1.do_smd_time';
    payload.fieldResolverMap['total_bag'] = 't1.total_bag';
    payload.fieldResolverMap['total_bagging'] = 't1.total_bagging';
    payload.fieldResolverMap['do_smd_detail_id'] = 't3.do_smd_detail_id';
    payload.fieldResolverMap['branch_name'] = 't4.branch_name';
    payload.fieldResolverMap['total_bag_representative'] = 't1.total_bag_representative';

    payload.globalSearchFields = [
      {
        field: 'vendorName',
      },
      {
        field: 'branchName',
      },
      {
        field: 'vendorCode',
      },
      {
        field: 'doSmdCode',
      },
    ];

    const repo = new OrionRepositoryService(DoSmd, 't1');

    const q = repo.findAllRaw();
    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['t1.do_smd_code', 'Nomor SMD'],
      ['TO_CHAR(t1.do_smd_time, \'DD Mon YYYY HH24:MI\')', 'Tanggal di Buat'],
      ['t4.branch_name', 'Gerai Asal'],
      ['t1.vendor_name', 'Vendor'],
      ['t1.total_bag', 'Gabung Paket'],
      ['t1.total_bag_representative', 'Gabung Kota'],
    );

    q.leftJoin(e => e.vendor, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.doSmdDetails, 't3', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.branch, 't4', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.andWhereRaw('t1.is_deleted = false');
    q.andWhere(e => e.isVendor, w => w.isTrue());

    q.orderBy({ createdTime: 'DESC' });
    const data = await q.exec();
    return data;
  }
}
