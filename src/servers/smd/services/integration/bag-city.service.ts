import { Injectable, Param, PayloadTooLargeException } from '@nestjs/common';
import moment = require('moment');
import express = require('express');
import { AuthService } from '../../../../shared/services/auth.service';
import { BagCityResponseVm, ListBagCityResponseVm, ListDetailBagCityResponseVm } from '../../models/bag-city-response.vm';
import { BagCityPayloadVm } from '../../models/bag-city-payload.vm';
import { RawQueryService } from '../../../../shared/services/raw-query.service';
import { BagRepresentative } from '../../../../shared/orm-entity/bag-representative';
import { CustomCounterCode } from '../../../../shared/services/custom-counter-code.service';
import { BagRepresentativeItem } from '../../../../shared/orm-entity/bag-representative-item';
import { BagRepresentativeSmdQueueService } from '../../../queue/services/bag-representative-smd-queue.service';
import { PrintBagCityPayloadVm } from '../../models/print-bag-city-payload.vm';
import { RequestErrorService } from '../../../../shared/services/request-error.service';
import { RepositoryService } from '../../../../shared/services/repository.service';
import { PrinterService } from '../../../../shared/services/printer.service';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { MetaService } from '../../../../shared/services/meta.service';

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
      ['t1.total_weight', 'totalWeight'],
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
      {
        field: 'bagRepresentativeItemId',
      },
    ];
    payload.fieldResolverMap['bagRepresentativeId'] = 't1.bag_representative_id';
    const repo = new OrionRepositoryService(BagRepresentativeItem, 't1');

    const q = repo.findAllRaw();
    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['t1.bag_representative_id', 'bagRepresentativeId'],
      ['t1.bag_representative_item_id', 'bagRepresentativeItemId'],
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
    const paramBagRepresentativeCode = await CustomCounterCode.bagCityCodeCounter(dateNow);
    const permissionPayload = AuthService.getPermissionTokenPayload();
    const authMeta = AuthService.getAuthData();

    result.status = 'error';

    if (awbNumber.length != 12) {
      result.message = 'Nomor Resi tidak valid';
      return result;
    }

    if (payload.representativeId == "null") {
      result.message = 'Representative Id tidak valid';
      return result;
    }

    if (payload.bagRepresentativeId == "null") {
      result.message = 'Bag Representative Id tidak valid';
      return result;
    }

    let bagRepresentativeId = '';
    let bagRepresentativeCode = '';

    // NOTE : ambil data AWB dan Representative nya
    let rawQuery = `
      SELECT
        a.awb_id,
        a.ref_awb_number,
        r.representative_id,
        r.representative_code,
        a.total_weight_rounded as weight,
        ai.awb_item_id
      FROM awb a
      INNER JOIN representative r ON a.ref_representative_code = r.representative_code
      INNER JOIN awb_item ai ON a.awb_id = ai.awb_id
      WHERE
        a.ref_awb_number = '${awbNumber}' AND
        a.is_deleted = false
      LIMIT 1;
      `;
    const dataAwb = await RawQueryService.query(rawQuery);
    if (dataAwb.length == 0) {
      result.message = 'Nomor Resi tidak ditemukan';
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
    if( (payload.representativeId) && (payload.representativeId != dataAwb[0].representative_id) ){
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
        totalWeight: total_weight.toString(),
        totalItem: parseInt(dataBagRepresentative[0].total_item)+1,
      });
    }

    if (!payload.bagRepresentativeId) {
      const createBagRepresentative = BagRepresentative.create();
      createBagRepresentative.representativeIdTo = dataAwb[0].representative_id;
      createBagRepresentative.branchId = permissionPayload.branchId.toString();
      createBagRepresentative.totalItem = 1;
      createBagRepresentative.totalWeight = dataAwb[0].weight.toString();
      createBagRepresentative.bagRepresentativeCode = paramBagRepresentativeCode;
      createBagRepresentative.bagRepresentativeDate = dateNow;
      createBagRepresentative.userIdCreated = authMeta.userId.toString();
      createBagRepresentative.userIdUpdated = authMeta.userId.toString();
      createBagRepresentative.createdTime = dateNow;
      createBagRepresentative.updatedTime = dateNow;
      await BagRepresentative.save(createBagRepresentative);

      bagRepresentativeId = createBagRepresentative.bagRepresentativeId;
      bagRepresentativeCode = createBagRepresentative.bagRepresentativeCode;
    }

    const bagRepresentativeItem = BagRepresentativeItem.create();
    bagRepresentativeItem.bagRepresentativeId = bagRepresentativeId;
    bagRepresentativeItem.refAwbNumber = dataAwb[0].ref_awb_number;
    bagRepresentativeItem.awbId = dataAwb[0].awb_id;
    bagRepresentativeItem.awbItemId = dataAwb[0].awb_item_id;
    bagRepresentativeItem.weight = dataAwb[0].weight;
    bagRepresentativeItem.representativeIdTo = dataAwb[0].representative_id;
    bagRepresentativeItem.userIdCreated = authMeta.userId.toString();
    bagRepresentativeItem.userIdUpdated = authMeta.userId.toString();
    bagRepresentativeItem.createdTime = moment().toDate();
    bagRepresentativeItem.updatedTime = moment().toDate();
    BagRepresentativeItem.save(bagRepresentativeItem);

    BagRepresentativeSmdQueueService.perform(
      dataAwb[0].awb_item_id,
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
      `TEXT 30,120,"5",0,1,1,0,"GABUNG SORTIR KOTA"\n` +
      `BARCODE 30,200,"128",100,1,0,3,10,"${bagging.bagRepresentativeCode}"\n` +
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
}
