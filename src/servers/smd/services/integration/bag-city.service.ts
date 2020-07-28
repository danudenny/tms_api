import { Injectable, Param, PayloadTooLargeException } from '@nestjs/common';
import moment = require('moment');
import express = require('express');
import { AuthService } from '../../../../shared/services/auth.service';
import { BagCityResponseVm } from '../../models/bag-city-response.vm';
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

@Injectable()
export class BagCityService {
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
