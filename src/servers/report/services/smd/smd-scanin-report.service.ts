// #region import
import { Injectable, HttpStatus } from '@nestjs/common';
import moment = require('moment');
import express = require('express');
import fs = require('fs');

import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { RedisService } from '../../../../shared/services/redis.service';
import { RequestErrorService } from '../../../../shared/services/request-error.service';
import { DoSmdDetail } from '../../../../shared/orm-entity/do_smd_detail';
import { ScanOutVendorReportVm } from '../../../smd/models/scanout-smd-vendor.response.vm';
import { CsvHelper } from '../../../../shared/helpers/csv-helpers';
import { Bag } from '../../../../shared/orm-entity/bag';

@Injectable()
export class SmdScaninReportService {
  constructor() {}

  static async storeExcelPayload(
    payload: any,
  ): Promise<ScanOutVendorReportVm> {
    const result = new ScanOutVendorReportVm();
    result.id = await CsvHelper.storePayload(
      payload,
      'scan-in-smd',
    );
    return result;
  }

  static async generateScanInCSV(
    res: express.Response,
    queryParams: ScanOutVendorReportVm,
  ): Promise<any> {
    const payload = await CsvHelper.retrieveGenericData<any>(
      'scan-in-smd',
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

    const data = await this.getDataCsvScanInSmd(p);

    const fileName = 'data_' + moment().format('YYMMDD_HHmmss') + '.csv';

    await CsvHelper.generateCSV(res, data, fileName);
  }

  static async generateScanInBranchCSV(
    res: express.Response,
    queryParams: ScanOutVendorReportVm,
  ): Promise<any> {
    const payload = await CsvHelper.retrieveGenericData<any>(
      'scan-in-smd',
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

    const data = await this.getDataCsvScanInBranchSmd(p);

    const fileName = 'data_' + moment().format('YYMMDD_HHmmss') + '.csv';

    await CsvHelper.generateCSV(res, data, fileName);
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
    payload.fieldResolverMap['is_intercity'] = 'ds.is_intercity';

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
      {
        field: 'is_intercity',
      },
    ];

    const repo = new OrionRepositoryService(DoSmdDetail, 'dsd');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q);
    q.selectRaw(
      ['ds.do_smd_code', 'No SMD'],
      [`CASE WHEN ds.is_intercity = 1 THEN 'DALAM KOTA' ELSE 'LUAR KOTA' END`, 'Jenis SJ'],
      ['TO_CHAR(ds.do_smd_time, \'DD Mon YYYY HH24:MI\')', 'Tgl Di Buat'],
      ['TO_CHAR(dsd.arrival_time, \'DD Mon YYYY HH24:MI\')', 'Tgl Tiba'],
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

  static async getDataCsvScanInBranchSmd(
    payload: BaseMetaPayloadVm,
  ): Promise<any> {

    payload.fieldResolverMap['bagging_datetime'] =  'b.created_time';
    payload.fieldResolverMap['branch_id'] = 'bhin.branch_id';
    payload.fieldResolverMap['bag_number_seq'] = `CONCAT(b.bag_number, LPAD(bi.bag_seq::text, 3, '0'))`;
    payload.fieldResolverMap['scan_in_datetime'] = 'bhin.history_date';

    const repo = new OrionRepositoryService(Bag, 'b');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q);

    q.selectRaw(
      [`CONCAT(b.bag_number, LPAD(bi.bag_seq::text, 3, '0'))`, 'No. Gabung Paket'],
      ['bb.branch_name', 'Gerai'],
      [`TO_CHAR(b.created_time, \'DD Mon YYYY HH24:MI\')`, 'Tgl Gab. Paket'],
      [`CASE
          WHEN bhin.history_date IS NULL THEN 'Belum Scan IN'
          ELSE TO_CHAR(bhin.history_date, \'DD Mon YYYY HH24:MI\')
        END`, 'Tgl Scan Gab. Paket'],
      [`CASE
          WHEN b.representative_id_to IS NULL then 'Belum Upload'
          ELSE r.representative_name
        END`, 'Tujuan'],
      [`(
        SELECT
          count(bia.awb_number)
        FROM bag_item_awb bia
        WHERE
          bia.bag_item_id = bi.bag_item_id AND
          bia.is_deleted = FALSE
        GROUP BY bia.bag_item_id)`, 'Jumlah Resi'],
      [`CONCAT(bi.weight::numeric(10,0), ' kg')`, 'Total Berat (Kg)'],
      [`CONCAT(
          CASE
            WHEN bi.weight > 10 THEN bi.weight
            ELSE 10
          END,' kg')`, 'weight_accumulative'],
      [`CONCAT(u.first_name, ' ', u.last_name)`, 'User'],
    );

    q.innerJoin(e => e.bagItems, 'bi', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.leftJoin(e => e.branch, 'br', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.leftJoinRaw(
      'bag_item_history',
      'bhin',
      'bhin.bag_item_id = bi.bag_item_id AND bhin.bag_item_status_id IN (3550 , 3500) AND bhin.is_deleted = FALSE',
    );
    q.leftJoin(e => e.representative, 'r', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.leftJoinRaw(
      'branch',
      'bb',
      'bhin.branch_id=bb.branch_id and bb.is_deleted = FALSE ',
    );
    q.leftJoinRaw(
      'users',
      'u',
      'u.user_id=bhin.user_id_updated and u.is_deleted = FALSE ',
    );
    q.andWhere(e => e.isDeleted, w => w.isFalse());
    q.andWhereRaw('bhin.bag_item_status_id in( 3550, 3500)');

    const data = await q.exec();
    return data;
  }
}
