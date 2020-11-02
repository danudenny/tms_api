// #region import
import { Injectable, HttpStatus } from '@nestjs/common';
import moment = require('moment');
import express = require('express');
import fs = require('fs');

import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { RedisService } from '../../../../shared/services/redis.service';
import { RequestErrorService } from '../../../../shared/services/request-error.service';

import { ScanOutVendorReportVm } from '../../models/scanout-smd-vendor.response.vm';
import { DoSmdDetail } from '../../../../shared/orm-entity/do_smd_detail';

@Injectable()
export class ScaninSmdReportService {

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

  static async generateScanInCSV(
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

    const data = await this.getDataCsvScanInSmd(p);

    const fileName = 'data_' + moment().format('YYMMDD_HHmmss') + '.csv';

    await this.generateCSV(res, data, fileName);
  }

  static async getDataCsvScanInSmd(
    payload: BaseMetaPayloadVm,
  ): Promise<any> {

    payload.fieldResolverMap['do_smd_time'] = 'ds.do_smd_time';
    payload.fieldResolverMap['branch_id_from'] = 'dsd.branch_id_from';
    payload.fieldResolverMap['branch_id_to'] = 'dsd.branch_id_to';
    payload.fieldResolverMap['do_smd_detail_id'] = 'dsd.do_smd_detail_id';
    payload.fieldResolverMap['do_smd_code'] = 'ds.do_smd_code';
    payload.fieldResolverMap['arrival_time'] = 'dsd.arrival_time';

    payload.globalSearchFields = [
      {
        field: 'do_smd_time',
      },
      {
        field: 'branch_id_from',
      },
      {
        field: 'branch_id_to',
      },
      {
        field: 'do_smd_detail_id',
      },
      {
        field: 'do_smd_code',
      },
      {
        field: 'arrival_time',
      },
    ];

    const repo = new OrionRepositoryService(DoSmdDetail, 'dsd');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);
    q.selectRaw(
      ['ds.do_smd_code', 'No SMD'],
      ['ds.do_smd_time', 'Tgl Di Buat'],
      ['dsd.arrival_time', 'Tgl Tiba'],
      ['e.fullname', 'Handover'],
      ['dsv.vehicle_number', 'Kendaraan'],
      ['bf.branch_name', 'Gerai Asal'],
      ['bt.branch_name', 'Gerai Tujuan'],
      ['dss.do_smd_status_title', 'Status Terakhir'],
      ['dsd.total_bag', 'Gabung Paket'],
      ['dsd.total_bagging', 'Bagging'],
      ['dsd.total_bag_representative', 'Gabung Kota'],
    );

    q.innerJoinRaw(
      'do_smd',
      'ds',
      'dsd.do_smd_id = ds.do_smd_id and ds.is_deleted = false',
    );
    q.innerJoinRaw(
      'do_smd_vehicle',
      'dsv',
      'ds.vehicle_id_last = dsv.do_smd_vehicle_id  and dsv.is_deleted = false',
    );
    q.leftJoinRaw(
      'branch',
      'bf',
      'dsd.branch_id_from = bf.branch_id and bf.is_deleted = false',
    );
    q.leftJoinRaw(
      'branch',
      'bt',
      'dsd.branch_id_to  = bt.branch_id  and bt.is_deleted = false',
    );
    q.leftJoinRaw(
      'employee',
      'e',
      'dsv.employee_id_driver = e.employee_id and e.is_deleted = false',
    );
    q.leftJoinRaw(
      'do_smd_status',
      'dss',
      'dsd.do_smd_status_id_last = dss.do_smd_status_id and dss.is_deleted = false',
    );
    q.andWhereRaw('ds.is_vendor = false');
    q.andWhere(e => e.isDeleted, w => w.isFalse());

    const data = await q.exec();
    return data;
  }
}
