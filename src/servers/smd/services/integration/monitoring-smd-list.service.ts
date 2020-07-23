import { Injectable, Param, PayloadTooLargeException } from '@nestjs/common';
import moment = require('moment');
import express = require('express');
import fastcsv = require('fast-csv');
import fs = require('fs');
import xlsx = require('xlsx');
import { RedisService } from '../../../../shared/services/redis.service';
import { MonitoringResponseVm } from '../../models/smd-monitoring-response.vm';
import { HttpStatus } from '@nestjs/common';
import { AuthService } from '../../../../shared/services/auth.service';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { QueryBuilderService } from '../../../../shared/services/query-builder.service';
import { MetaService } from '../../../../shared/services/meta.service';
import { RequestErrorService } from '../../../../shared/services/request-error.service';
import { StoreExcelMonitoringPayloadVm, MonitoringPayloadVm } from '../../models/smd-monitoring-payload.vm';

@Injectable()
export class MonitoringSmdServices {
  static async monitoringSmdList(
    payload: BaseMetaPayloadVm,
  ): Promise<MonitoringResponseVm> {

    // payload.fieldResolverMap['do_smd_time'] = 'ds.do_smd_time';
    payload.fieldResolverMap['do_smd_code'] = 'ds.do_smd_code';
    payload.fieldResolverMap['branch_id'] = 'ds.branch_id';
    payload.fieldResolverMap['departure_date_time'] = 'ds.departure_date_time';
    payload.fieldResolverMap['arrival_date_time'] = 'ds.arrival_date_time';

    payload.fieldFilterManualMap['departure_date_time'] = true;
    payload.globalSearchFields = [
      {
        field: 'do_smd_code',
      },
      {
        field: 'branch_id',
      },
      // {
      //   field: 'departure_date_time',
      // },
      {
        field: 'arrival_date_time',
      },
    ];
    if (!payload.sortBy) {
      payload.sortBy = 'departure_date_time';
    }
    const q = await this.getQuery(payload);
    const total = await QueryBuilderService.count(q, '1');
    payload.applyRawPaginationToQueryBuilder(q);
    const data = await q.getRawMany();

    const result = new MonitoringResponseVm();
    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  static async getQuery(
    payload: BaseMetaPayloadVm,
  ): Promise<any> {
    // payload.fieldFilterManualMap['do_smd_code'] = true;
    const q = payload.buildQueryBuilder();

    q.select('ds.do_smd_code', 'do_smd_code')
      .addSelect('ds.do_smd_time', 'do_smd_time')
      .addSelect('ds.branch_id', 'branch_id')
      .addSelect('ds.route', 'route')
      .addSelect('ds.vehicle_number', 'vehicle_number')
      .addSelect('ds.vehicle_name', 'vehicle_name')
      .addSelect(`ds.trip`, 'trip')
      .addSelect('ds.total_weight', 'total_weight')
      .addSelect('ds.vehicle_capacity', 'vehicle_capacity')
      .addSelect(`((total_weight / vehicle_capacity::integer) * 100)`, 'percentage_load')
      .addSelect('ds.departure_date_time', 'departure_date_time')
      .addSelect('ds.transit_date_time', 'transit_date_time')
      .addSelect('ds.arrival_date_time', 'arrival_date_time')
      .from(subQuery => {
        subQuery
          .select('ds.do_smd_code')
          .addSelect(`ds.do_smd_time`, 'do_smd_time')
          .addSelect(`bf.branch_id`, 'branch_id')
          .addSelect(`bf.branch_name || ' - ' || ds.branch_to_name_list`, 'route')
          .addSelect(`dsv.vehicle_number`, 'vehicle_number')
          .addSelect(`v.vehicle_name`, 'vehicle_name')
          .addSelect(`ds.trip`, 'trip')
          .addSelect(`(
                      select
                        sum(bi.weight)
                      from do_smd_detail dsd
                      inner join do_smd_detail_item dsdi on dsd.do_smd_detail_id = dsdi.do_smd_detail_id and dsdi.is_deleted =false
                      left join bag_item bi on dsdi.bag_item_id = bi.bag_item_id and bi.is_deleted = false
                      where
                        dsd.do_smd_id = ds.do_smd_id
                      group by
                        dsd.do_smd_id
                    )`, 'total_weight')
          .addSelect(`v.vehicle_capacity`, 'vehicle_capacity')
          .addSelect(`ds.departure_date_time`, 'departure_date_time')
          .addSelect(`ds.transit_date_time`, 'transit_date_time')
          .addSelect(`ds.arrival_date_time`, 'arrival_date_time')
          .from('do_smd', 'ds')
          .innerJoin(
            'do_smd_vehicle',
            'dsv',
            'ds.vehicle_id_last = dsv.do_smd_vehicle_id and dsv.is_deleted = false ',
          )
          .leftJoin(
            'branch',
            'bf',
            'ds.branch_id = bf.branch_id and bf.is_deleted = false',
          )
          .leftJoin(
            'vehicle',
            'v',
            'dsv.vehicle_number = v.vehicle_number and v.is_deleted = false ',
          );

        payload.applyFiltersToQueryBuilder(subQuery, ['departure_date_time']);

        subQuery
          .andWhere('ds.is_deleted = false');
        return subQuery;
      }, 'ds');
    return q;
  }
  static async exportExcel(
    res: express.Response,
    queryParams: MonitoringPayloadVm,
  ): Promise<any> {
    const body = await this.retrieveData(queryParams.id);

    const payload = new BaseMetaPayloadVm();
    payload.filters = body.filters ? body.filters : [];
    payload.sortBy = body.sortBy ? body.sortBy : '';
    payload.sortDir = body.sortDir ? body.sortDir : 'desc';
    payload.search = body.search ? body.search : '';

    payload.fieldResolverMap['do_smd_time'] = 'ds.do_smd_time';
    payload.fieldResolverMap['do_smd_code'] = 'ds.do_smd_code';
    payload.fieldResolverMap['branch_id'] = 'ds.branch_id';
    payload.fieldResolverMap['departure_date_time'] = 'ds.departure_date_time';
    payload.fieldResolverMap['arrival_date_time'] = 'ds.arrival_date_time';

    payload.fieldFilterManualMap['do_smd_time'] = true;
    payload.globalSearchFields = [
      {
        field: 'do_smd_code',
      },
      {
        field: 'branch_id',
      },
      {
        field: 'departure_date_time',
      },
      {
        field: 'arrival_date_time',
      },
    ];
    if (!payload.sortBy) {
      payload.sortBy = 'do_smd_time';
    }

    const q = await this.getQuery(payload);

    const data = await q.getRawMany();
    await this.getExcel(res, data);
  }

  static async exportCSV(
    res: express.Response,
    queryParams: MonitoringPayloadVm,
  ): Promise<any> {
    const body = await this.retrieveData(queryParams.id);

    const payload = new BaseMetaPayloadVm();
    payload.filters = body.filters ? body.filters : [];
    payload.sortBy = body.sortBy ? body.sortBy : '';
    payload.sortDir = body.sortDir ? body.sortDir : 'desc';
    payload.search = body.search ? body.search : '';

    payload.fieldResolverMap['do_smd_time'] = 'ds.do_smd_time';
    payload.fieldResolverMap['do_smd_code'] = 'ds.do_smd_code';
    payload.fieldResolverMap['branch_id'] = 'ds.branch_id';
    payload.fieldResolverMap['departure_date_time'] = 'ds.departure_date_time';
    payload.fieldResolverMap['arrival_date_time'] = 'ds.arrival_date_time';

    payload.fieldFilterManualMap['do_smd_time'] = true;
    payload.globalSearchFields = [
      {
        field: 'do_smd_code',
      },
      {
        field: 'branch_id',
      },
      {
        field: 'departure_date_time',
      },
      {
        field: 'arrival_date_time',
      },
    ];
    if (!payload.sortBy) {
      payload.sortBy = 'do_smd_time';
    }

    const q = await this.getQueryExportCSVOnly(payload);

    const data = await q.getRawMany();
    await this.getCSV(res, data);
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

    // mapping data to row excel
    result.map(function(item, index) {
      rows[index] = [];
      item.map(function(detail) {
        const content = {};
        content['Nomor SMD'] = detail.do_smd_code;
        content['Tanggal Berangkat'] = detail.departure_date_time ?
          moment(detail.departure_date_time).format('DD MMM YYYY HH:mm') :
          null;
        content['Tanggal Transit'] = detail.transit_date_time ?
            moment(detail.transit_date_time).format('DD MMM YYYY HH:mm') :
            null;
        content['Tanggal Tiba'] = detail.arrival_date_time ?
          moment(detail.arrival_date_time).format('DD MMM YYYY HH:mm') :
          null;
        content['Rute'] = detail.route;
        content['Nomor Mobil'] = detail.vehicle_number;
        content['Type Truck'] = detail.vehicle_name;
        content['Trip'] = detail.trip;
        content['Actual Berat'] = detail.total_weight ?
          Number(detail.total_weight).toFixed(0) + ' KG' :
          null;
        content['Kapasitas'] = detail.vehicle_capacity ?
          detail.vehicle_capacity + ' KG' :
          null;
        content['Load %'] = detail.percentage_load ?
          Number(detail.percentage_load).toFixed(2) + ' %' :
          null;
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
    return RedisService.get<T>(`export-monitoring-smd-${identifier}`, true);
  }

  public static async retrieveData(id: string): Promise<MonitoringPayloadVm> {
    const data = await this.retrieveGenericData<MonitoringPayloadVm>(id);
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
      `export-monitoring-smd-${identifier}`,
      payloadBody,
      10 * 60,
      true,
    );
    return {
      id: identifier,
    };
  }

  static async getCSV(
    res: express.Response,
    data: any,
  ): Promise<any> {
    // const rows = [];
    // const result = [];
    // const maxRowPerSheet = 65000;
    // let idx = 1;
    // // tslint:disable-next-line: no-shadowed-variable
    // let multiply = 1;

    // // handle multiple sheet for large data
    // if (data.length > maxRowPerSheet) {
    //   do {
    //     const slicedData = data.slice(idx, maxRowPerSheet * multiply);
    //     result.push(slicedData);
    //     idx = multiply * slicedData + 1;
    //     multiply++;
    //   }
    //   while (data.length > maxRowPerSheet * multiply);
    // } else {
    //   result.push(data);
    // }

    // // mapping data to row excel
    // result.map(function(item, index) {
    //   rows[index] = [];
    //   item.map(function(detail) {
    //     const content = {};
    //     content['Nomor SMD'] = detail.do_smd_code;
    //     content['Tanggal Berangkat'] = detail.departure_date_time ?
    //       moment(detail.departure_date_time).format('DD MMM YYYY HH:mm') :
    //       null;
    //     content['Tanggal Transit'] = detail.transit_date_time ?
    //         moment(detail.transit_date_time).format('DD MMM YYYY HH:mm') :
    //         null;
    //     content['Tanggal Tiba'] = detail.arrival_date_time ?
    //       moment(detail.arrival_date_time).format('DD MMM YYYY HH:mm') :
    //       null;
    //     content['Rute'] = detail.route;
    //     content['Nomor Mobil'] = detail.vehicle_number;
    //     content['Type Truck'] = detail.vehicle_name;
    //     content['Trip'] = detail.trip;
    //     content['Actual Berat'] = detail.total_weight ?
    //       Number(detail.total_weight).toFixed(0) + ' KG' :
    //       null;
    //     content['Kapasitas'] = detail.vehicle_capacity ?
    //       detail.vehicle_capacity + ' KG' :
    //       null;
    //     content['Load %'] = detail.percentage_load ?
    //       Number(detail.percentage_load).toFixed(2) + ' %' :
    //       null;
    //     rows[index].push(content);
    //   });
    // });

    // NOTE: create excel using unique name
    const fileName = 'data_' + moment().format('YYMMDD_HHmmss') + '.csv';
    try {
      const ws = fs.createWriteStream(fileName);
      fastcsv.write(data, {headers: true}).pipe(ws);
      // NOTE: create now workbok for storing excel rows
      // response passed through express response
      // const newWB = xlsx.utils.book_new();
      // rows.map((detail, index) => {
      //   const newWS = xlsx.utils.json_to_sheet(detail);
      //   xlsx.utils.book_append_sheet(newWB, newWS, (result.length > 1 ?
      //     `${moment().format('YYYY-MM-DD')}(${index + 1})` :
      //     moment().format('YYYY-MM-DD')));
      // });
      // xlsx.writeFile(newWB, fileName);

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

  static async getQueryExportCSVOnly(
    payload: BaseMetaPayloadVm,
  ): Promise<any> {
    // payload.fieldFilterManualMap['do_smd_code'] = true;
    const q = payload.buildQueryBuilder();
    q.select('ds.do_smd_code', 'Nomor SMD')
      // .addSelect('ds.do_smd_time', 'do_smd_time')
      // .addSelect('ds.branch_id', 'branch_id')
      .addSelect('ds.route', 'Rute')
      .addSelect('ds.vehicle_number', 'Nomor Mobil')
      .addSelect('ds.vehicle_name', 'Type Truck')
      .addSelect(`ds.trip`, 'Trip')
      .addSelect('ds.total_weight', 'Actual Berat')
      .addSelect('ds.vehicle_capacity', 'Kapasitas')
      .addSelect(`((total_weight / vehicle_capacity::integer) * 100)`, 'Load %')
      .addSelect('ds.departure_date_time', 'Tanggal Berangkat')
      .addSelect('ds.transit_date_time', 'Tanggal Transit')
      .addSelect('ds.arrival_date_time', 'Tanggal Tiba')
      .from(subQuery => {
        subQuery
          .select('ds.do_smd_code')
          .addSelect(`ds.do_smd_time`, 'do_smd_time')
          .addSelect(`bf.branch_id`, 'branch_id')
          .addSelect(`bf.branch_name || ' - ' || ds.branch_to_name_list`, 'route')
          .addSelect(`dsv.vehicle_number`, 'vehicle_number')
          .addSelect(`v.vehicle_name`, 'vehicle_name')
          .addSelect(`ds.trip`, 'trip')
          .addSelect(`(
                      select
                        sum(bi.weight)
                      from do_smd_detail dsd
                      inner join do_smd_detail_item dsdi on dsd.do_smd_detail_id = dsdi.do_smd_detail_id and dsdi.is_deleted =false
                      left join bag_item bi on dsdi.bag_item_id = bi.bag_item_id and bi.is_deleted = false
                      where
                        dsd.do_smd_id = ds.do_smd_id
                      group by
                        dsd.do_smd_id
                    )`, 'total_weight')
          .addSelect(`v.vehicle_capacity`, 'vehicle_capacity')
          .addSelect(`ds.departure_date_time`, 'departure_date_time')
          .addSelect(`ds.transit_date_time`, 'transit_date_time')
          .addSelect(`ds.arrival_date_time`, 'arrival_date_time')
          .from('do_smd', 'ds')
          .innerJoin(
            'do_smd_vehicle',
            'dsv',
            'ds.vehicle_id_last = dsv.do_smd_vehicle_id and dsv.is_deleted = false ',
          )
          .leftJoin(
            'branch',
            'bf',
            'ds.branch_id = bf.branch_id and bf.is_deleted = false',
          )
          .leftJoin(
            'vehicle',
            'v',
            'dsv.vehicle_number = v.vehicle_number and v.is_deleted = false ',
          );

        payload.applyFiltersToQueryBuilder(subQuery, ['departure_date_time']);

        subQuery
          .andWhere('ds.is_deleted = false');
        return subQuery;
      }, 'ds');
    return q;
  }
}
