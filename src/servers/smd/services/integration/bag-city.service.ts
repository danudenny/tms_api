import { Injectable, HttpStatus, BadRequestException } from '@nestjs/common';
import moment = require('moment');
import express = require('express');
import xlsx = require('xlsx');
import fs = require('fs');
import { AuthService } from '../../../../shared/services/auth.service';
import { BagCityResponseVm, ListBagCityResponseVm, ListDetailBagCityResponseVm } from '../../models/bag-city-response.vm';
import { BagCityPayloadVm, BagCityExportPayloadVm } from '../../models/bag-city-payload.vm';
import { RawQueryService } from '../../../../shared/services/raw-query.service';
import { BagRepresentative } from '../../../../shared/orm-entity/bag-representative';
import { CustomCounterCode } from '../../../../shared/services/custom-counter-code.service';
import { BagRepresentativeItem } from '../../../../shared/orm-entity/bag-representative-item';
import { BagRepresentativeSmdQueueService } from '../../../queue/services/bag-representative-smd-queue.service';
import { PrintBagCityPayloadVm, PrintBagCityForPaperPayloadVm } from '../../models/print-bag-city-payload.vm';
import { RequestErrorService } from '../../../../shared/services/request-error.service';
import { RepositoryService } from '../../../../shared/services/repository.service';
import { PrinterService } from '../../../../shared/services/printer.service';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { MetaService } from '../../../../shared/services/meta.service';
import { RedisService } from '../../../../shared/services/redis.service';
import { BagRepresentativeHistory } from '../../../../shared/orm-entity/bag-representative-history';
import { SharedService } from '../../../../shared/services/shared.service';
import { BAG_STATUS } from '../../../../shared/constants/bag-status.constant';

@Injectable()
export class BagCityService {
  static async listBagging(
    payload: BaseMetaPayloadVm,
  ): Promise<ListBagCityResponseVm> {
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
    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['t1.bag_representative_code', 'bagRepresentativeCode'],
      ['t1.bag_representative_id', 'bagRepresentativeId'],
      ['TO_CHAR(t1.bag_representative_date, \'dd-mm-YYYY HH24:MI:SS\')', 'bagRepresentativeDate'],
      ['COUNT(t4.bag_representative_item_id)', 'totalItem'],
      ['CAST(t1.total_weight AS DECIMAL(18,2))', 'totalWeight'],
      ['t2.representative_code', 'representativeCode'],
      ['t2.representative_name', 'representativeName'],
      ['t3.branch_name', 'branchBagging'],
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

    q.orderBy({ createdTime: 'DESC' });
    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();
    const result = new ListBagCityResponseVm();
    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  static async listDetailBagging(
    payload: BaseMetaPayloadVm,
  ): Promise<ListDetailBagCityResponseVm> {
    // mapping search field and operator default ilike
    payload.globalSearchFields = [
      {
        field: 'bagRepresentativeId',
      },
    ];
    payload.fieldResolverMap['bagRepresentativeId'] = 't1.bag_representative_id';
    const repo = new OrionRepositoryService(BagRepresentativeItem, 't1');

    const q = repo.findAllRaw();
    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['t1.ref_awb_number', 'refAwbNumber'],
      ['CAST(t1.weight AS DECIMAL(18,2))', 'weight'],
    );
    q.orderBy({ createdTime: 'DESC' });
    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();
    const result = new ListDetailBagCityResponseVm();
    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  static async createBagging(
    payload: BagCityPayloadVm,
  ): Promise<BagCityResponseVm> {
    const result = new BagCityResponseVm();
    const awbNumber = payload.awbNumber;
    const dateNow = moment().toDate();
    // let paramBagRepresentativeCode = await CustomCounterCode.bagCityCodeCounter(dateNow);

    const permissionPayload = AuthService.getPermissionTokenPayload();
    const authMeta = AuthService.getAuthData();

    result.status = 'error';

    if (awbNumber.length != 12) {
      result.message = 'Nomor Resi tidak valid';
      return result;
    }

    if (payload.representativeId == 'null') {
      result.message = 'Representative Id tidak valid';
      return result;
    }

    if (payload.bagRepresentativeId == 'null') {
      result.message = 'Bag Representative Id tidak valid';
      return result;
    }

    let bagRepresentativeId;
    let bagRepresentativeCode = '';

    // NOTE : ambil data AWB dan Representative nya
    let rawQuery = `
      SELECT
        a.awb_id,
        a.awb_number as ref_awb_number,
        r.representative_id,
        r.representative_code,
        a.total_weight_rounded as weight,
        ai.awb_item_id
      FROM temp_stt ts
      INNER JOIN awb a ON ts.nostt = a.awb_number AND a.is_deleted = false
      INNER JOIN awb_item ai ON a.awb_id = ai.awb_id
      LEFT JOIN representative r ON ts.perwakilan = r.representative_code
      WHERE
        ts.nostt = '${awbNumber}'
      LIMIT 1;
      `;
    const dataAwb = await RawQueryService.query(rawQuery);
    if (dataAwb.length == 0) {
      result.message = 'Nomor Resi tidak ditemukan';
      return result;
    }

    if (dataAwb[0].representative_id == null) {
      result.message = 'Representative pada AWB tidak ditemukan';
      return result;
    }

    rawQuery = `
      SELECT
        bri.ref_awb_number
      FROM bag_representative_item bri
      WHERE
        bri.ref_awb_number = '${awbNumber}' AND
        bri.is_deleted = false
      LIMIT 1;
      `;
    const dataCekAwbScan = await RawQueryService.query(rawQuery);
    if (dataCekAwbScan.length > 0) {
      result.message = 'Nomor Resi sudah pernah di scan';
      return result;
    }

    // NOTE : Cek Representative dari Payload dan data AWB yang dimasukkan
    if ( (payload.representativeId) && (payload.representativeId != dataAwb[0].representative_id) ) {
      result.message = 'Representative berbeda';
      return result;
    }

    // NOTE : Ambil data Bag representative yang sudah di input sebelumnya
    if (payload.bagRepresentativeId) {
      rawQuery = `
        SELECT
          br.bag_representative_id,
          br.bag_representative_code,
          br.total_item,
          br.total_weight
        FROM bag_representative br
        WHERE
          br.bag_representative_id = '${payload.bagRepresentativeId}' AND
          br.is_deleted = false
        LIMIT 1;
        `;
      const dataBagRepresentative = await RawQueryService.query(rawQuery);
      if (dataBagRepresentative.length == 0) {
        result.message = 'Data Bag City tidak ditemukan';
        return result;
      }

      bagRepresentativeId = result.bagRepresentativeId = dataBagRepresentative[0].bag_representative_id;
      bagRepresentativeCode = result.bagRepresentativeCode = dataBagRepresentative[0].bag_representative_code;

      const total_weight = (Number(dataAwb[0].weight) + Number(dataBagRepresentative[0].total_weight));
      await BagRepresentative.update(bagRepresentativeId, {
        totalWeight: total_weight,
        totalItem: parseInt(dataBagRepresentative[0].total_item) + 1,
      });
    }

    if (!payload.bagRepresentativeId) {
      const paramBagRepresentativeCode = await CustomCounterCode.bagCityCodeRandomCounter(dateNow);
      const redlock = await RedisService.redlock(`redlock:bagRepresentative:${paramBagRepresentativeCode}`, 10);
      if (redlock) {
        const createBagRepresentative = BagRepresentative.create();
        createBagRepresentative.representativeIdTo = dataAwb[0].representative_id;
        createBagRepresentative.branchId = permissionPayload.branchId.toString();
        createBagRepresentative.totalItem = 1;
        createBagRepresentative.totalWeight = dataAwb[0].weight.toString();
        createBagRepresentative.bagRepresentativeCode = paramBagRepresentativeCode;
        createBagRepresentative.bagRepresentativeDate = dateNow;
        createBagRepresentative.userIdCreated = authMeta.userId;
        createBagRepresentative.userIdUpdated = authMeta.userId;
        createBagRepresentative.createdTime = dateNow;
        createBagRepresentative.updatedTime = dateNow;
        createBagRepresentative.bagRepresentativeStatusIdLast = BAG_STATUS.IN_SORTIR;
        await BagRepresentative.save(createBagRepresentative);

        bagRepresentativeId = createBagRepresentative.bagRepresentativeId;
        bagRepresentativeCode = createBagRepresentative.bagRepresentativeCode;

        const createBagRepresentativeHistory = BagRepresentativeHistory.create();
        createBagRepresentativeHistory.bagRepresentativeId = bagRepresentativeId;
        createBagRepresentativeHistory.representativeIdTo = dataAwb[0].representative_id;
        createBagRepresentativeHistory.branchId = permissionPayload.branchId.toString();
        createBagRepresentativeHistory.totalItem = 1;
        createBagRepresentativeHistory.totalWeight = dataAwb[0].weight.toString();
        createBagRepresentativeHistory.bagRepresentativeCode = paramBagRepresentativeCode;
        createBagRepresentativeHistory.bagRepresentativeDate = dateNow;
        createBagRepresentativeHistory.userIdCreated = authMeta.userId.toString();
        createBagRepresentativeHistory.userIdUpdated = authMeta.userId.toString();
        createBagRepresentativeHistory.createdTime = dateNow;
        createBagRepresentativeHistory.updatedTime = dateNow;
        createBagRepresentativeHistory.bagRepresentativeStatusIdLast = BAG_STATUS.IN_SORTIR.toString();
        await BagRepresentativeHistory.save(createBagRepresentativeHistory);
      } else {
        throw new BadRequestException('Data Gabung Sortir Kota Sedang di proses, Silahkan Coba Beberapa Saat');
      }
      // const cekDoubleCode = await BagRepresentative.findOne({
      //   where: {
      //     bagRepresentativeCode: paramBagRepresentativeCode,
      //     isDeleted: false,
      //   },
      // });
      // if (cekDoubleCode) {
      //   paramBagRepresentativeCode =  await CustomCounterCode.bagCityCodeRandomCounter(dateNow);
      // }

    }

    const bagRepresentativeItem = BagRepresentativeItem.create();
    bagRepresentativeItem.bagRepresentativeId = bagRepresentativeId;
    bagRepresentativeItem.refAwbNumber = dataAwb[0].ref_awb_number;
    bagRepresentativeItem.awbId = dataAwb[0].awb_id;
    bagRepresentativeItem.awbItemId = dataAwb[0].awb_item_id;
    bagRepresentativeItem.weight = dataAwb[0].weight;
    bagRepresentativeItem.representativeIdTo = dataAwb[0].representative_id;
    bagRepresentativeItem.userIdCreated = authMeta.userId;
    bagRepresentativeItem.userIdUpdated = authMeta.userId;
    bagRepresentativeItem.createdTime = moment().toDate();
    bagRepresentativeItem.updatedTime = moment().toDate();
    BagRepresentativeItem.save(bagRepresentativeItem);

    let branchName = '';
    let cityName = '';
    const branch = await SharedService.getDataBranchCity(permissionPayload.branchId);
    if (branch) {
      branchName = branch.branchName;
      cityName = branch.district ? branch.district.city.cityName : '';
    }

    BagRepresentativeSmdQueueService.perform(
      dataAwb[0].awb_item_id,
      dataAwb[0].ref_awb_number,
      authMeta.userId,
      permissionPayload.branchId,
      branchName,
      cityName,
    );

    result.status = 'success';
    result.awbNumber = awbNumber;
    result.representativeId = dataAwb[0].representative_id;
    result.representativeCode = dataAwb[0].representative_code;
    result.bagRepresentativeId = bagRepresentativeId;
    result.bagRepresentativeCode = bagRepresentativeCode;
    result.message = 'Scan gabung paket Kota berhasil';
    return result;
  }

  public static async printBagging(
    res: express.Response,
    queryParams: PrintBagCityPayloadVm,
  ) {
    const bagging = await RepositoryService.bagRepresentative
      .loadById(queryParams.id)
      .select({
        bagRepresentativeId: true, // needs to be selected due to users relations are being included
        bagRepresentativeCode: true,
        totalItem: true,
        totalWeight: true,
        representative: {
          representativeCode: true,
          representativeName: true,
        },
      })
      .exec();

    if (!bagging) {
      RequestErrorService.throwObj({
        message: 'Bagging tidak ditemukan',
      });
    }

    const rawPrinterCommands =
    `SIZE 80 mm, 100 mm\n` +
    `SPEED 3\n` +
    `DENSITY 8\n` +
    `DIRECTION 0\n` +
    `OFFSET 0\n` +
    `CLS\n` +
    `TEXT 10,120,"5",0,1,1,0,"GABUNG SORTIR KOTA"\n` +
    `BARCODE -5,200,"128",70,1,0,3,10,"${bagging.bagRepresentativeCode}"\n` +
    `TEXT 10,380,"3",0,1,1,"Jumlah koli : ${bagging.totalItem}"\n` +
    `TEXT 10,420,"3",0,1,1,"Berat : ${bagging.totalWeight}"\n` +
    `TEXT 10,460,"5",0,1,1,0,"${bagging.representative.representativeCode}"\n` +
    `TEXT 10,540,"3",0,1,1,"${bagging.representative.representativeName}"\n` +
    `PRINT 1\n` +
    `EOP`;

    const printerName = 'BarcodePrinter';
    PrinterService.responseForRawCommands({
      res,
      rawCommands: rawPrinterCommands,
      printerName,
    });
  }

  public static async printBaggingFromJsreport(
    res: express.Response,
    queryParams: PrintBagCityPayloadVm,
  ) {
    const bagging = await RepositoryService.bagRepresentative
      .loadById(queryParams.id)
      .select({
        bagRepresentativeId: true, // needs to be selected due to users relations are being included
        bagRepresentativeCode: true,
        totalItem: true,
        totalWeight: true,
        representative: {
          representativeCode: true,
          representativeName: true,
        },
      })
      .exec();

    if (!bagging) {
      RequestErrorService.throwObj({
        message: 'Bagging tidak ditemukan',
      });
    }

    const listPrinterName = ['BarcodePrinter'];

    PrinterService.responseForJsReport({
      res,
      templates: [
        {
          templateName: 'surat-jalan-barcode-gabung-kota',
          templateData: {
            data: bagging,
          },
          printCopy: 1,
        },
      ],
      listPrinterName,
    });
  }

  public static async printBagCityForPaper(
    res: express.Response,
    queryParams: PrintBagCityForPaperPayloadVm,
  ) {
    const q = RepositoryService.bagRepresentative.findOne();
    q.innerJoin(e => e.bagRepresentativeItems);
    q.leftJoin(e => e.representative);

    const bagRepresentative = await q
      .select({
        bagRepresentativeId: true, // needs to be selected due to do_smd relations are being included
        bagRepresentativeCode: true,
        bagRepresentativeDate: true,
        representative: {
          representativeId: true,
          representativeCode: true,
        },
        bagRepresentativeItems: {
          bagRepresentativeItemId: true,
          refAwbNumber: true,
          weight: true,
        },
      })
      .where(e => e.bagRepresentativeId, w => w.equals(queryParams.id))
      .andWhere(e => e.isDeleted, w => w.isFalse())
      .andWhere(e => e.bagRepresentativeItems.isDeleted, w => w.isFalse());
    if (!bagRepresentative) {
      RequestErrorService.throwObj({
        message: 'Gabung Kota tidak ditemukan',
      });
    }
    const date = moment(bagRepresentative.bagRepresentativeDate).format('YYYY-MM-DD HH:mm:ss');

    const listPrinterName = ['BarcodePrinter', 'StrukPrinter'];
    PrinterService.responseForJsReport({
      res,
      templates: [
        {
          templateName: 'bag-representative',
          templateData: {
            data: bagRepresentative,
            meta: {
              createdTime: date,
            },
          },
          printCopy: queryParams.printCopy ? queryParams.printCopy : 3,
        },
      ],
      listPrinterName,
    });
  }

  static async exportExcel(
    res: express.Response,
    queryParams: BagCityExportPayloadVm,
  ): Promise<any> {
    const body = await this.retrieveData(queryParams.id);

    const payload = new BaseMetaPayloadVm();
    payload.filters = body.filters ? body.filters : [];
    payload.sortBy = body.sortBy ? body.sortBy : '';
    payload.sortDir = body.sortDir ? body.sortDir : 'desc';
    payload.search = body.search ? body.search : '';

    payload.fieldResolverMap['bag_representative_date'] = 'brs.bag_representative_date';
    payload.fieldResolverMap['bag_representative_code'] = 'brs.bag_representative_code';
    payload.fieldResolverMap['branch_id'] = 'brs.branch_id';

    payload.globalSearchFields = [
      {
        field: 'bag_representative_code',
      },
      {
        field: 'branch_id',
      },
    ];
    if (!payload.sortBy) {
      payload.sortBy = 'bag_representative_date';
    }

    const q = await this.getQuery(payload);

    const data = await q.getRawMany();
    await this.getExcel(res, data);
  }

  static async getQuery(
    payload: BaseMetaPayloadVm,
  ): Promise<any> {
    // payload.fieldFilterManualMap['do_smd_code'] = true;
    const q = payload.buildQueryBuilder();

    q.select('brs.bag_representative_code', 'bag_representative_code')
      .addSelect('brs.representative_name', 'representative_name')
      .addSelect('brs.bag_representative_date', 'bag_representative_date')
      .addSelect('brs.branch_id', 'branch_id')
      .addSelect('brs.branch_name', 'branch_name')
      .addSelect('brs.total_item', 'total_item')
      .addSelect('brs.total_weight', 'total_weight')
      .from(subQuery => {
        subQuery
          .select('br.bag_representative_code')
          .addSelect(`r.representative_name`, 'representative_name')
          .addSelect(`br.bag_representative_date`, 'bag_representative_date')
          .addSelect(`br.branch_id`, 'branch_id')
          .addSelect(`b.branch_name`, 'branch_name')
          .addSelect('br.total_item', 'total_item')
          .addSelect(`(
                      select
                        sum(bri.weight)
                      from bag_representative brdetail
                      inner join bag_representative_item bri on br.bag_representative_id = bri.bag_representative_id and br.is_deleted = false
                      where
                      brdetail.bag_representative_id = br.bag_representative_id
                      group by
                        br.bag_representative_id
                    )`, 'total_weight')
          .from('bag_representative', 'br')
          .leftJoin(
            'branch',
            'b',
            'br.branch_id = br.branch_id and b.is_deleted = false',
          ).leftJoin(
            'representative',
            'r',
            'br.representative_id_to = r.representative_id and r.is_deleted = false',
          );

        payload.applyFiltersToQueryBuilder(subQuery, ['bag_representative_date']);

        subQuery
          .andWhere('br.is_deleted = false');
        return subQuery;
      }, 'brs');
    return q;
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
        content['Kode Bag Representative'] = detail.bag_representative_code;
        content['Kantor Bag Representative'] = detail.representative_name;
        content['Tanggal Bagging'] = detail.bag_representative_date ?
            moment(detail.bag_representative_date).format('DD MMM YYYY HH:mm') :
            null;
        content['Tujuan'] = detail.branch_name;
        content['Total Item'] = detail.total_item;
        content['Total Berat'] = detail.total_weight;
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
          message: 'error ketika download excel Bag Representative SMD',
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

  public static async retrieveData(id: string): Promise<BagCityExportPayloadVm> {
    const data = await this.retrieveGenericData<BagCityExportPayloadVm>(id);
    if (!data) {
      RequestErrorService.throwObj({
        message: 'Data export excel tidak ditemukan',
      });
    }
    return data;
  }

  static async retrieveGenericData<T = any>(
    identifier: string | number,
  ) {
    return RedisService.get<T>(`export-monitoring-smd-${identifier}`, true);
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
}
