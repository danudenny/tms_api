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

@Injectable()
export class ScanoutSmdExportService {
  static async exportExcel(
    res: express.Response,
    queryParams: StoreExcelScanOutPayloadVm,
  ): Promise<any> {
    const body = await this.retrieveData(queryParams.id);

    const payload = new BaseMetaPayloadVm();
    payload.filters = body.filters ? body.filters : [];
    payload.sortBy = body.sortBy ? body.sortBy : '';
    payload.sortDir = body.sortDir ? body.sortDir : 'desc';
    payload.search = body.search ? body.search : '';

    if (!payload.sortBy) {
      payload.sortBy = 'do_smd_time';
    }
    payload.limit = 100000;
    const data = await ScanoutSmdListService.getQueryScanoutList(payload, false);
    await this.getExcel(res, data.data);
  }

  static async getExcel(
    res: express.Response,
    data: any,
  ): Promise<any> {
    const rows = [];
    const result = [];
    const maxRowPerSheet = 65000;
    let idx = 1;
    // tslint:disable-next-line: no-shadowed-variable
    let multiply = 1;

    // handle multiple sheet for large data
    if (data.length > maxRowPerSheet) {
      do {
        const slicedData = data.slice(idx, maxRowPerSheet * multiply);
        result.push(slicedData);
        idx = multiply * slicedData + 1;
        multiply++;
      }
      while (data.length > maxRowPerSheet * multiply);
    } else {
      result.push(data);
    }
    console.log(data, result);
    // mapping data to row excel
    result.map(function(item, index) {
      rows[index] = [];
      item.map(function(detail) {
        const content = {};
        content['Nomor SMD'] = detail.do_smd_code;
        content['Tanggal di Buat'] = detail.do_smd_time ?
          moment(detail.do_smd_time).format('DD MMM YYYY HH:mm') :
          null;
        content['Handover'] = detail.fullname;
        content['Kendaraan'] = detail.vehicle_number;
        content['Gerai Asal'] = detail.branch_from_name;
        content['Gerai Tujuan'] = detail.branch_to_name;
        content['Gabung Paket'] = detail.total_bag;
        content['Bagging'] = detail.total_bagging;
        rows[index].push(content);
      });
    });

    // NOTE: create excel using unique name
    const fileName = 'data_' + moment().format('YYMMDD_HHmmss') + '.xlsx';
    try {
      // NOTE: create now workbok for storing excel rows
      // response passed through express response
      const newWB = xlsx.utils.book_new();
      rows.map((detail, index) => {
        const newWS = xlsx.utils.json_to_sheet(detail);
        xlsx.utils.book_append_sheet(newWB, newWS, (result.length > 1 ?
          `${moment().format('YYYY-MM-DD')}(${index + 1})` :
          moment().format('YYYY-MM-DD')));
      });
      xlsx.writeFile(newWB, fileName);

      const filestream = fs.createReadStream(fileName);
      const mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

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
