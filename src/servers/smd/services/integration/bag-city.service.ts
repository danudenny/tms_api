import { Injectable, HttpStatus, BadRequestException } from '@nestjs/common';
import moment = require('moment');
import express = require('express');
import xlsx = require('xlsx');
import fs = require('fs');
import { AuthService } from '../../../../shared/services/auth.service';
import { BagCityResponseVm, ListBagCityResponseVm, ListDetailBagCityResponseVm, BagCityMoreResponseVm, BagCityDataMoreResponseVm, BagCityDetailScanResponseVm, CreateBagCityResponseVm } from '../../models/bag-city-response.vm';
import { BagCityPayloadVm, BagCityExportPayloadVm, BagCityMorePayloadVm, BagCityInputManualDataPayloadVm, BagCityDetailScanPayloadVm, BagCityCreateHeaderPayloadVm } from '../../models/bag-city-payload.vm';
import { RawQueryService } from '../../../../shared/services/raw-query.service';
import { BagRepresentative } from '../../../../shared/orm-entity/bag-representative';
import { CustomCounterCode } from '../../../../shared/services/custom-counter-code.service';
import { BagRepresentativeItem } from '../../../../shared/orm-entity/bag-representative-item';
import { BagRepresentativeSmdQueueService } from '../../../queue/services/bag-representative-smd-queue.service';
import { PrintBagCityPayloadVm, PrintBagCityForPaperPayloadVm, BagCityExternalPrintPayloadVm, BagCityExternalPrintExecutePayloadVm } from '../../models/print-bag-city-payload.vm';
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
import { Not, createQueryBuilder, getManager } from 'typeorm';

@Injectable()
export class BagCityService {
  static async listBagCity(
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

  static async listDetailBagCity(
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

  static async createBagCity(
    payload: BagCityPayloadVm,
  ): Promise<BagCityResponseVm> {
    const result = new BagCityResponseVm();
    let inputManualPrevData = new BagCityInputManualDataPayloadVm();
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
      INNER JOIN awb a ON ts.nostt = a.awb_number AND a.is_deleted = FALSE
      INNER JOIN awb_item ai ON a.awb_id = ai.awb_id AND ai.is_deleted = FALSE
      LEFT JOIN representative r ON ts.perwakilan = r.representative_code AND r.is_deleted = FALSE
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
      if (!payload.representativeId) {
        const dataCekValidRepresentative = await BagRepresentativeItem.findOne({
          select: ['bagRepresentativeId'],
          where: {
            bagRepresentativeId: payload.bagRepresentativeId,
            representativeIdTo: Not(dataAwb[0].representative_id),
            isDeleted: false,
          },
        });
        if (dataCekValidRepresentative) {
          result.message = 'Representative berbeda';
          return result;
        }
      }
      if (!payload.inputManualPrevData) { // handle input manual, data not found because data not insert yet
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
        inputManualPrevData = {
          bag_representative_id: dataBagRepresentative[0].bag_representative_id,
          bag_representative_code: dataBagRepresentative[0].bag_representative_code,
          total_item: dataBagRepresentative[0].total_item,
          total_weight: dataBagRepresentative[0].total_weight,
        };
      } else {
        inputManualPrevData = payload.inputManualPrevData;
      }

      bagRepresentativeId = result.bagRepresentativeId = inputManualPrevData.bag_representative_id.toString();
      bagRepresentativeCode = result.bagRepresentativeCode = inputManualPrevData.bag_representative_code;

      const total_weight = (Number(dataAwb[0].weight) + Number(inputManualPrevData.total_weight));
      const total_item = Number(inputManualPrevData.total_item) + 1;

      result.inputManualPrevData = {
        bag_representative_code: inputManualPrevData.bag_representative_code,
        bag_representative_id: inputManualPrevData.bag_representative_id,
        total_item,
        total_weight,
      };
      await BagRepresentative.update(bagRepresentativeId, {
        totalWeight: total_weight,
        totalItem: total_item,
      }, {
        transaction: false,
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
        await BagRepresentative.save(createBagRepresentative, {
          transaction: false,
        });

        result.inputManualPrevData = {
          bag_representative_code: createBagRepresentative.bagRepresentativeCode,
          bag_representative_id: createBagRepresentative.bagRepresentativeId,
          total_item: Number(createBagRepresentative.totalItem),
          total_weight: createBagRepresentative.totalWeight,
        };

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
        result.message = 'Data Gabung Sortir Kota Sedang di proses, Silahkan Coba Beberapa Saat';
        return result;
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
    BagRepresentativeItem.insert(bagRepresentativeItem, {
      transaction: false,
    });

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
    result.bagRepresentativeItemId = bagRepresentativeItem.bagRepresentativeItemId;
    result.refAwbNumber = dataAwb[0].ref_awb_number;
    result.weight = dataAwb[0].weight;

    result.message = 'Scan gabung paket Kota berhasil';
    return result;
  }

  static async createBagCityHeader(
    payload: BagCityCreateHeaderPayloadVm,
  ): Promise<CreateBagCityResponseVm> {
    const result = new CreateBagCityResponseVm();
    const permissionPayload = AuthService.getPermissionTokenPayload();
    const authMeta = AuthService.getAuthData();
    const dateNow = moment().toDate();

    const rawQuery = `
      SELECT
        r.representative_code
      FROM temp_stt ts
      INNER JOIN representative r ON ts.perwakilan = r.representative_code AND r.is_deleted = FALSE
      WHERE
        ts.nostt = '${payload.awbNumber}'
      LIMIT 1;
    `;
    const dataAwb = await RawQueryService.query(rawQuery);

    if (dataAwb.length == 0) {
      RequestErrorService.throwObj({
        message : 'Nomor Resi tidak ditemukan',
      });
    }

    const paramBagRepresentativeCode = await CustomCounterCode.bagCityCodeRandomCounter(dateNow);
    const createBagRepresentative = BagRepresentative.create();
    createBagRepresentative.representativeIdTo = dataAwb[0].representative_id;
    createBagRepresentative.branchId = permissionPayload.branchId.toString();
    createBagRepresentative.totalItem = 0;
    createBagRepresentative.totalWeight = 0;
    createBagRepresentative.bagRepresentativeCode = paramBagRepresentativeCode;
    createBagRepresentative.bagRepresentativeDate = dateNow;
    createBagRepresentative.userIdCreated = authMeta.userId;
    createBagRepresentative.userIdUpdated = authMeta.userId;
    createBagRepresentative.createdTime = dateNow;
    createBagRepresentative.updatedTime = dateNow;
    createBagRepresentative.bagRepresentativeStatusIdLast = BAG_STATUS.IN_SORTIR;
    await BagRepresentative.insert(createBagRepresentative);

    result.bagRepresentativeCode = createBagRepresentative.bagRepresentativeCode;
    result.bagRepresentativeId = createBagRepresentative.bagRepresentativeId;
    result.representativeCode = dataAwb[0].representative_code;
    return result;
  }

  static async createBagCityMore(
    payload: BagCityMorePayloadVm,
  ): Promise<BagCityMoreResponseVm> {
    const result = new BagCityMoreResponseVm();
    const p = new BagCityPayloadVm();
    const uniqueBagCity = [];
    let totalSuccess = 0;
    let totalError = 0;

    p.bagRepresentativeId = payload.bagRepresentativeId;
    p.representativeId = payload.representativeId;
    result.data = [];

    if (typeof(payload.awbNumber) != 'object') {
      payload.awbNumber = [payload.awbNumber];
    }
    // TODO:
    // 1. get response createBagging of each awbNumber
    // 2. check and/or update bagRepresentativeId every time insert/create bag-city
    // 3. populate total
    for (const awbNumber of payload.awbNumber) {
      p.awbNumber = awbNumber;

      // handle duplikat
      if (uniqueBagCity.includes(awbNumber)) {
        result.data.push({
          status: 'error',
          message: `Scan resi ${awbNumber} duplikat!`,
          awbNumber,
        } as BagCityDataMoreResponseVm);
        continue;
      }
      uniqueBagCity.push(awbNumber);

      const res = await this.createBagCity(p);

      p.bagRepresentativeId = p.bagRepresentativeId ? p.bagRepresentativeId : res.bagRepresentativeId;
      p.representativeId = p.representativeId ? p.representativeId : res.representativeId;
      p.inputManualPrevData = res.inputManualPrevData;
      result.data.push({
        ...res,
        awbNumber,
      });

      if (res.status == 'success') {
        totalSuccess++;
      } else {
        totalError++;
      }
    }

    result.totalData = payload.awbNumber.length;
    result.totalError = totalError;
    result.totalSuccess = totalSuccess;
    return result;
  }

  public static async printBagCity(
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
    `TEXT 30,120,"5",0,1,1,0,"GABUNG SORTIR KOTA"\n` +
    `BARCODE 2,200,"128",100,1,0,3,10,"${bagging.bagRepresentativeCode}"\n` +
    `TEXT 30,380,"3",0,1,1,"Jumlah koli : ${bagging.totalItem}"\n` +
    `TEXT 30,420,"3",0,1,1,"Berat : ${bagging.totalWeight}"\n` +
    `TEXT 30,460,"5",0,1,1,0,"${bagging.representative.representativeCode}"\n` +
    `TEXT 30,540,"3",0,1,1,"${bagging.representative.representativeName}"\n` +
    `PRINT 1\n` +
    `EOP`;

    const printerName = 'BarcodePrinter';
    PrinterService.responseForRawCommands({
      res,
      rawCommands: rawPrinterCommands,
      printerName,
    });
  }

  public static async printBagCityFromJsReport(
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

  /**
   * Store Bag City Print Data to Redis
   *
   * @param {BagCityExternalPrintPayloadVm} payload
   * @memberof BagCityService
   */
  static async storeBagCityExternalPrint(payload: BagCityExternalPrintPayloadVm) {
    const bagRepresentativeId = payload.bagRepresentativeId;
    const key: string = `print-external-data-bagcity-${bagRepresentativeId}`;

    return RedisService.storeData(key, payload);
  }

  /**
   * Execute Bag City Print Data from Redis to JSReport
   *
   * @static
   * @param {express.Response} res
   * @param {BagCityExternalPrintExecutePayloadVm} params
   * @return pipe data of PDF Report.
   * @memberof BagCityService
   */
  static async executeBagCityExternalPrint(
    res: express.Response,
    params: BagCityExternalPrintExecutePayloadVm,
  ) {
    const bagId = params.id;
    const key: string = `print-external-data-bagcity-${bagId}`;

    const printData = await RedisService.retrieveData(key);
    const items = printData && printData.bagRepresentativeItems || [];

    if (!items.length) {
      RequestErrorService.throwObj({
        message: `BagCity data tidak ditemukan!`,
      });
    }

    const bagRepresentativeDate = moment(printData.bagRepresentativeDate).format('YYYY-MM-DD HH:mm:ss');
    const formatedData = {
      ...printData,
      representative: {
        representativeId: printData.representativeId,
        representativeCode: printData.representativeCode,
      },
    };

    delete formatedData.representativeId;
    delete formatedData.representativeCode;

    const templateData = {
      data: formatedData,
      meta: { createdTime: bagRepresentativeDate },
    };
    const listPrinterName = ['BarcodePrinter', 'StrukPrinter'];

    PrinterService.responseForJsReport({
      res,
      templates: [
        {
          templateName: 'bag-representative',
          templateData,
          printCopy: params.printCopy ? params.printCopy : 1,
        },
      ],
      listPrinterName,
    });
  }

  static async listDetailScanBagCity(
    payload: BagCityDetailScanPayloadVm,
    ): Promise<BagCityDetailScanResponseVm> {
    const result = new BagCityDetailScanResponseVm();

    const qb = createQueryBuilder();
    qb.addSelect( 'br.bag_representative_code', 'bagRepresentativeCode');
    qb.addSelect( 'br.bag_representative_id', 'bagRepresentativeId');
    qb.addSelect( 'bri.bag_representative_item_id', 'bagRepresentativeItemId');
    qb.addSelect( 'bri.ref_awb_number', 'refAwbNumber');
    qb.addSelect( 'r.representative_code', 'representativeCode');
    qb.addSelect( 'r.representative_id', 'representativeId');
    qb.addSelect( 'bri.weight', 'weight');
    qb.from('bag_representative_item', 'bri');
    qb.innerJoin('bag_representative', 'br', 'br.bag_representative_id = bri.bag_representative_id AND br.is_deleted = FALSE');
    qb.innerJoin('representative', 'r', 'r.representative_id = br.representative_id_to AND r.is_deleted = FALSE');
    qb.andWhere(`bri.bag_representative_id = '${payload.bagRepresentativeId}'`);
    qb.andWhere(`bri.is_deleted = FALSE`);
    result.data = await qb.getRawMany();

    return result;
  }
}