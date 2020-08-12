import { Injectable } from '@nestjs/common';
import moment = require('moment');
import express = require('express');
import fs = require('fs');
import xlsx = require('xlsx');
import { RedisService } from '../../../../shared/services/redis.service';
import { HttpStatus } from '@nestjs/common';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { RequestErrorService } from '../../../../shared/services/request-error.service';
import { ScanoutSmdListService } from './scanout-smd-list.service';
import { StoreExcelScanOutPayloadVm } from '../../models/scanout-smd.payload.vm';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { DoSmd } from '../../../../shared/orm-entity/do_smd';

@Injectable()
export class ScanoutSmdExportService {
  static async exportCSV(
    res: express.Response,
    queryParams: StoreExcelScanOutPayloadVm,
  ): Promise<any> {
    // NOTE: get payload json from redis,
    // retrieve data then convert to CSV
    const body = await this.retrieveData(queryParams.id);

    const payload = new BaseMetaPayloadVm();
    payload.filters = body.filters ? body.filters : [];
    payload.sortBy = body.sortBy ? body.sortBy : '';
    payload.sortDir = body.sortDir ? body.sortDir : 'desc';
    payload.search = body.search ? body.search : '';

    if (!payload.sortBy) {
      payload.sortBy = 'do_smd_time';
    }

    // limit data query, avoid default limit 20 in OrionRepository query
    payload.limit = 100000000;
    const data = await this.getQueryCsvOnly(payload);
    await this.getCSV(res, data.data);
  }

  static async getCSV(
    res: express.Response,
    data: any,
  ): Promise<any> {
    const fastcsv = require('fast-csv');

    // NOTE: create excel using unique name
    const fileName = 'data_' + moment().format('YYMMDD_HHmmss') + '.csv';
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
          message: 'error ketika download excel Monitoring SMD',
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

  static async getQueryCsvOnly(payload: BaseMetaPayloadVm): Promise<any> {
    payload.fieldResolverMap['do_smd_time'] = 'ds.do_smd_time';
    payload.fieldResolverMap['branch_id_from'] = 'ds.branch_id';
    payload.fieldResolverMap['branch_id_to'] = 'dsd.branch_id_to';
    payload.fieldResolverMap['do_smd_code'] = 'ds.do_smd_code';
    if (!payload.sortDir) {
      payload.sortDir = 'desc';
    }
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
        field: 'do_smd_code',
      },
    ];

    const repo = new OrionRepositoryService(DoSmd, 'ds');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);
    q.selectRaw(
      ['ds.do_smd_code', 'Nomor SMD'],
      ['TO_CHAR(ds.do_smd_time, \'DD Mon YYYY HH24:MI\')', 'Tanggal di Buat'],
      ['e.fullname', 'Handover'],
      ['dsv.vehicle_number', 'Kendaraan'],
      ['b.branch_name', 'Gerai Asal'],
      ['ds.branch_to_name_list', 'Gerai Tujuan'],
      ['ds.total_bag', 'Gabung Paket'],
      ['ds.total_bagging', 'Bagging'],
      ['dss.do_smd_status_title', 'Status Terakhir'],
      ['ds.total_bag_representative', 'Gabung Kota'],
    );

    q.innerJoinRaw(
      'do_smd_detail',
      'dsd',
      'dsd.do_smd_id = ds.do_smd_id AND dsd.is_deleted = FALSE',
    );
    q.innerJoin(e => e.doSmdVehicle, 'dsv', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.leftJoin(e => e.branch, 'b', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.leftJoin(e => e.doSmdVehicle.employee, 'e', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.leftJoinRaw(
      'do_smd_status',
      'dss',
      'ds.do_smd_status_id_last = dss.do_smd_status_id AND dss.is_deleted = FALSE',
    );
    q.groupByRaw('ds.do_smd_id, ds.do_smd_code, ds.do_smd_time, e.fullname, e.employee_id, dsv.vehicle_number, b.branch_name, ds.total_bag, ds.total_bagging, ds.total_bag_representative, dss.do_smd_status_title');
    q.andWhere(e => e.isDeleted, w => w.isFalse());
    const result = {
      data: null,
    };
    result.data = await q.exec();
    return result;
  }

  // NOTE: get data payload json in redis
  static async retrieveGenericData<T = any>(
    identifier: string | number,
  ) {
    return RedisService.get<T>(`export-scan-out-smd-${identifier}`, true);
  }

  public static async retrieveData(id: string): Promise<BaseMetaPayloadVm> {
    const data = await this.retrieveGenericData<BaseMetaPayloadVm>(id);
    if (!data) {
      RequestErrorService.throwObj({
        message: 'Data export excel tidak ditemukan',
      });
    }
    return data;
  }

  // NOTE: store payload before download GET METHOD
  // payload GET METHOD for download can not receive json except parameter
  static async storeExcelPayload(payloadBody: any) {
    if (!payloadBody) {
      RequestErrorService.throwObj({
        message: 'body cannot be null or undefined',
      });
    }
    const identifier = moment().format('YYMMDDHHmmss');
    // const authMeta = AuthService.getAuthData();
    RedisService.setex(
      `export-scan-out-smd-${identifier}`,
      payloadBody,
      10 * 60,
      true,
    );
    return {
      id: identifier,
    };
  }
}