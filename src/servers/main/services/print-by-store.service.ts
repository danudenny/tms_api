import { RedisService } from '../../../shared/services/redis.service';
import { PrintDoPodStorePayloadBodyVm } from '../models/print-do-pod-store-payload.vm';
import { PrintDoPodBagStorePayloadBodyVm } from '../models/print-do-pod-bag-store-payload.vm';
import { PrintDoPodDeliverStorePayloadBodyVM } from '../models/print-do-pod-deliver-store-payload.vm';
import { PrintDoPodPayloadQueryVm } from '../models/print-do-pod-payload.vm';
import { RequestErrorService } from '../../../shared/services/request-error.service';
import express = require('express');
import { PrintDoPodBagPayloadQueryVm } from '../models/print-do-pod-bag-payload.vm';
import { PrintDoPodDeliverPayloadQueryVm } from '../models/print-do-pod-deliver-payload.vm';
import { PrintDoPodService } from './print-do-pod.service';
import { PrintDoPodBagService } from './print-do-pod-bag.service';
import { PrintDoPodDeliverService } from './print-do-pod-deliver.service';

export class PrintByStoreService {
  static async retrieveGenericPrintData<T = any>(prefix: string, identifier: string | number) {
    return RedisService.get<T>(`print-store-${prefix}-${identifier}`, true);
  }

  static async storeGenericPrintData(prefix: string, identifier: string | number, genericData: any) {
    return RedisService.setex(`print-store-${prefix}-${identifier}`, genericData, 10 * 60, true);
  }

  static async storePrintDoPod(payloadBody: PrintDoPodStorePayloadBodyVm) {
    return this.storeGenericPrintData('do-pod', payloadBody.data.doPodId, payloadBody);
  }

  static async executePrintDoPod(
    res: express.Response,
    queryParams: PrintDoPodPayloadQueryVm,
  ) {
    const printPayload = await this.retrieveGenericPrintData<PrintDoPodStorePayloadBodyVm>('do-pod', queryParams.id);

    if (!printPayload) {
      RequestErrorService.throwObj({
        message: 'Surat jalan tidak ditemukan',
      });
    }

    return PrintDoPodService.printDoPodAndQueryMeta(res, printPayload.data, {
      userId: queryParams.userId,
      branchId: queryParams.branchId,
    }, {
      printCopy: queryParams.printCopy,
    });
  }

  static async storePrintDoPodBag(payloadBody: PrintDoPodBagStorePayloadBodyVm) {
    return this.storeGenericPrintData('do-pod-bag', payloadBody.data.doPodId, payloadBody);
  }

  static async executePrintDoPodBag(
    res: express.Response,
    queryParams: PrintDoPodBagPayloadQueryVm,
  ) {
    const printPayload = await this.retrieveGenericPrintData<PrintDoPodBagStorePayloadBodyVm>('do-pod-bag', queryParams.id);

    if (!printPayload.data) {
      RequestErrorService.throwObj({
        message: 'Surat jalan tidak ditemukan',
      });
    }

    return PrintDoPodBagService.printDoPodBagAndQueryMeta(res, printPayload.data, {
      userId: queryParams.userId,
      branchId: queryParams.branchId,
      templateType: +queryParams.type,
    }, {
      printCopy: queryParams.printCopy,
    });
  }

  static async storePrintDoPodDeliver(payloadBody: PrintDoPodDeliverStorePayloadBodyVM) {
    return this.storeGenericPrintData('do-pod-deliver', payloadBody.data.doPodDeliverId, payloadBody);
  }

  static async executePrintDoPodDeliver(
    res: express.Response,
    queryParams: PrintDoPodDeliverPayloadQueryVm,
  ) {
    const printPayload = await this.retrieveGenericPrintData<PrintDoPodDeliverStorePayloadBodyVM>('do-pod-deliver', queryParams.id);

    if (!printPayload.data) {
      RequestErrorService.throwObj({
        message: 'Surat jalan tidak ditemukan',
      });
    }

    return PrintDoPodDeliverService.printDoPodDeliverAndQueryMeta(res, printPayload.data, {
      userId: queryParams.userId,
      branchId: queryParams.branchId,
    }, {
      printCopy: queryParams.printCopy,
    });
  }
}
