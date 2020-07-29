import { RedisService } from '../../../shared/services/redis.service';
import { PrintDoPodVm } from '../models/print-do-pod.vm';
import { PrintDoPodBagVm } from '../models/print-do-pod-bag.vm';
import { PrintDoPodDeliverVm } from '../models/print-do-pod-deliver.vm';
import { PrintDoPodPayloadQueryVm } from '../models/print-do-pod-payload.vm';
import { RequestErrorService } from '../../../shared/services/request-error.service';
import express = require('express');
import { PrintDoPodBagPayloadQueryVm } from '../models/print-do-pod-bag-payload.vm';
import { PrintDoPodDeliverPayloadQueryVm } from '../models/print-do-pod-deliver-payload.vm';
import { PrintDoPodService } from './print-do-pod.service';
import { PrintDoPodBagService } from './print-do-pod-bag.service';
import { PrintDoPodDeliverService } from './print-do-pod-deliver.service';
import { PrintBagItemPayloadQueryVm } from '../models/print-bag-item-payload.vm';
import { PrintBagItemPaperVm } from '../models/print-bag-item-paper.vm';
import { PrintBagItemPaperService } from './print-bag-item-paper.service';
import { PrintBagItemStickerService } from './print-bag-item-sticker.service';
import { PrintBagItemStickerVm } from '../models/print-bag-item-sticker.vm';
import {
  PrintDoPodReturnAdmiStorePayloadVm,
  PrintDoPodReturnPayloadQueryVm,
} from '../models/print-do-pod-return.vm';
import { PrintService } from './print.service';

export class PrintByStoreService {
  static async retrieveGenericPrintData<T = any>(
    prefix: string,
    identifier: string | number,
  ) {
    return RedisService.get<T>(`print-store-${prefix}-${identifier}`, true);
  }

  static async storeGenericPrintData(
    prefix: string,
    identifier: string | number,
    genericData: any,
  ) {
    if (!genericData || !identifier) {
      RequestErrorService.throwObj({
        message: 'Data tidak valid',
      });
    }
    return RedisService.setex(
      `print-store-${prefix}-${identifier}`,
      genericData,
      10 * 60,
      true,
    );
  }

  static async storePrintDoPod(payloadBody: PrintDoPodVm) {
    return this.storeGenericPrintData(
      'do-pod',
      payloadBody.data.doPodId,
      payloadBody,
    );
  }

  static async executePrintDoPod(
    res: express.Response,
    queryParams: PrintDoPodPayloadQueryVm,
  ) {
    const printPayload = await this.retrieveGenericPrintData<PrintDoPodVm>(
      'do-pod',
      queryParams.id,
    );

    if (!printPayload || (printPayload && !printPayload.data)) {
      RequestErrorService.throwObj({
        message: 'Surat jalan tidak ditemukan',
      });
    }

    return PrintDoPodService.printDoPodAndQueryMeta(
      res,
      printPayload.data,
      {
        userId: queryParams.userId,
        branchId: queryParams.branchId,
      },
      {
        printCopy: queryParams.printCopy,
      },
    );
  }

  static async storePrintDoPodBag(payloadBody: PrintDoPodBagVm) {
    return this.storeGenericPrintData(
      'do-pod-bag',
      payloadBody.data.doPodId,
      payloadBody,
    );
  }

  static async executePrintDoPodBag(
    res: express.Response,
    queryParams: PrintDoPodBagPayloadQueryVm,
  ) {
    const printPayload = await this.retrieveGenericPrintData<PrintDoPodBagVm>(
      'do-pod-bag',
      queryParams.id,
    );

    if (!printPayload || (printPayload && !printPayload.data)) {
      RequestErrorService.throwObj({
        message: 'Surat jalan tidak ditemukan',
      });
    }

    return PrintDoPodBagService.printDoPodBagAndQueryMeta(
      res,
      printPayload.data,
      {
        userId: queryParams.userId,
        branchId: queryParams.branchId,
        templateType: +queryParams.type,
      },
      {
        printCopy: queryParams.printCopy,
      },
    );
  }

  static async storePrintDoPodDeliver(payloadBody: PrintDoPodDeliverVm) {
    return this.storeGenericPrintData(
      'do-pod-deliver',
      payloadBody.data.doPodDeliverId,
      payloadBody,
    );
  }

  static async executePrintDoPodDeliver(
    res: express.Response,
    queryParams: PrintDoPodDeliverPayloadQueryVm,
  ) {
    const printPayload = await this.retrieveGenericPrintData<
      PrintDoPodDeliverVm
    >('do-pod-deliver', queryParams.id);

    if (!printPayload || (printPayload && !printPayload.data)) {
      RequestErrorService.throwObj({
        message: 'Surat jalan tidak ditemukan',
      });
    }

    return PrintDoPodDeliverService.printDoPodDeliverAndQueryMeta(
      res,
      printPayload.data,
      {
        userId: queryParams.userId,
        branchId: queryParams.branchId,
      },
      {
        printCopy: queryParams.printCopy,
      },
    );
  }

  static async storePrintBagItemSticker(payloadBody: PrintBagItemStickerVm) {
    return this.storeGenericPrintData(
      'bag-item-for-sticker',
      payloadBody.data.bagItemId,
      payloadBody,
    );
  }

  static async executePrintBagItemSticker(
    res: express.Response,
    queryParams: PrintBagItemPayloadQueryVm,
  ) {
    const printPayload = await this.retrieveGenericPrintData<
      PrintBagItemStickerVm
    >('bag-item-for-sticker', queryParams.id);

    if (!printPayload || (printPayload && !printPayload.data)) {
      RequestErrorService.throwObj({
        message: 'Gabungan paket tidak ditemukan',
      });
    }

    return PrintBagItemStickerService.printBagItemSticker(
      res,
      printPayload.data,
      {
        bagItemAwbsTotal: printPayload.meta.bagItemAwbsTotal,
      },
    );
  }

  static async storePrintBagItemPaper(payloadBody: PrintBagItemPaperVm) {
    return this.storeGenericPrintData(
      'bag-item-for-paper',
      payloadBody.data.bagItemId,
      payloadBody,
    );
  }

  static async executePrintBagItemPaper(
    res: express.Response,
    queryParams: PrintBagItemPayloadQueryVm,
  ) {
    const printPayload = await this.retrieveGenericPrintData<
      PrintBagItemPaperVm
    >('bag-item-for-paper', queryParams.id);

    if (!printPayload || (printPayload && !printPayload.data)) {
      RequestErrorService.throwObj({
        message: 'Gabungan paket tidak ditemukan',
      });
    }

    return PrintBagItemPaperService.printBagItemPaperAndQueryMeta(
      res,
      printPayload.data,
      {
        userId: queryParams.userId,
        branchId: queryParams.branchId,
      },
    );
  }

  static async storePrintDoPodReturnAdmin(payloadBody: any) {
    return this.storeGenericPrintData(
      'do-pod-return-admin',
      payloadBody.userIdDriver,
      payloadBody,
    );
  }

  static async executePrintDoPodReturnAdmin(
    res: express.Response,
    queryParams: PrintDoPodReturnPayloadQueryVm,
  ) {
    const printPayload = await this.retrieveGenericPrintData<
      PrintDoPodReturnAdmiStorePayloadVm
    >('do-pod-return-admin', queryParams.userIdDriver);

    if (!printPayload) {
      RequestErrorService.throwObj({
        message: 'Tanda terima tidak di temukan',
      });
    }

    return PrintDoPodService.printDoPodDoReturnAdminByRequest(
      res,
      printPayload,
      queryParams,
    );
  }
}
