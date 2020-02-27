import { PrintDoPodDeliverPayloadQueryVm } from '../models/print-do-pod-deliver-payload.vm';
import { RepositoryService } from '../../../shared/services/repository.service';
import { RequestErrorService } from '../../../shared/services/request-error.service';
import { PrintDoPodDeliverDataVm } from '../models/print-do-pod-deliver.vm';
import { map } from 'lodash';
import { RawQueryService } from '../../../shared/services/raw-query.service';
import { PrinterService } from '../../../shared/services/printer.service';
import express = require('express');
import moment = require('moment');

export class PrintDoPodDeliverService {
  public static async printDoPodDeliverByRequest(
    res: express.Response,
    queryParams: PrintDoPodDeliverPayloadQueryVm,
  ) {
    const q = RepositoryService.doPodDeliver.findOne();
    q.leftJoin(e => e.doPodDeliverDetails);
    q.leftJoin(e => e.userDriver.employee);

    const doPodDeliver = await q
      .select({
        doPodDeliverId: true, // needs to be selected due to do_pod_deliver relations are being included
        doPodDeliverCode: true,
        description: true,
        userDriver: {
          userId: true,
          employee: {
            nickname: true,
            nik: true,
          },
        },
        doPodDeliverDetails: {
          doPodDeliverDetailId: true, // needs to be selected due to do_pod_deliver_detail relations are being included
          awbItem: {
            awbItemId: true, // needs to be selected due to awb_item relations are being included
            awb: {
              awbId: true,
              awbNumber: true,
              consigneeName: true,
              consigneeNumber: true,
              consigneeAddress: true,
              consigneeZip: true,
              totalCodValue: true,
              isCod: true,
            },
          },
        },
      })
      .where(e => e.doPodDeliverId, w => w.equals(queryParams.id))
      .andWhere(e => e.doPodDeliverDetails.isDeleted, w => w.isFalse());

    if (!doPodDeliver) {
      RequestErrorService.throwObj({
        message: 'Surat jalan tidak ditemukan',
      });
    }

    this.printDoPodDeliverAndQueryMeta(res, doPodDeliver as any, {
      userId: queryParams.userId,
      branchId: queryParams.branchId,
    }, {
      printCopy: queryParams.printCopy,
    });
  }

  public static async printDoPodDeliverAndQueryMeta(
    res: express.Response,
    data: Partial<PrintDoPodDeliverDataVm>,
    metaQuery: {
      userId: number;
      branchId: number;
    },
    templateConfig: {
      printCopy?: number;
    } = {
      printCopy: 1,
    },
  ) {
    const awbIds = map(data.doPodDeliverDetails, doPodDeliverDetail => doPodDeliverDetail.awbItem.awb.awbId);
    const result = await RawQueryService.query(`SELECT COALESCE(SUM(total_cod_value), 0) as total FROM awb WHERE awb_id IN (${awbIds.join(',')})`);
    let totalAllCod = result[0].total;

    if (totalAllCod < 1) {
      totalAllCod = 0;
    }

    const currentUser = await RepositoryService.user
      .loadById(metaQuery.userId)
      .select({
        userId: true, // needs to be selected due to users relations are being included
        employee: {
          nickname: true,
        },
      })
      .exec();

    if (!currentUser) {
      RequestErrorService.throwObj({
        message: 'User tidak ditemukan',
      });
    }

    const currentBranch = await RepositoryService.branch
      .loadById(metaQuery.branchId)
      .select({
        branchName: true,
      });

    if (!currentBranch) {
      RequestErrorService.throwObj({
        message: 'Gerai asal tidak ditemukan',
      });
    }

    const currentDate = moment();

    return this.printDoPodDeliver(res, data, {
      currentUserName: currentUser.employee.nickname,
      currentBranchName: currentBranch.branchName,
      date: currentDate.format('DD/MM/YY'),
      time: currentDate.format('HH:mm'),
      totalItems: data.doPodDeliverDetails.length,
      totalCod: totalAllCod,
    }, templateConfig);
  }

  public static async printDoPodDeliver(
    res: express.Response,
    data: Partial<PrintDoPodDeliverDataVm>,
    meta: {
      currentUserName: string;
      currentBranchName: string;
      date: string;
      time: string;
      totalItems: number;
      totalCod: number;
    },
    templateConfig: {
      printCopy?: number;
    } = {
      printCopy: 1,
    },
  ) {
    const jsreportParams = {
      data,
      meta,
    };

    PrinterService.responseForJsReport({
      res,
      printerName: 'StrukPrinter',
      templates: [
        {
          templateName: 'surat-jalan-antar',
          templateData: jsreportParams,
          printCopy: templateConfig.printCopy,
        },
        {
          templateName: 'surat-jalan-antar-admin',
          templateData: jsreportParams,
          printCopy: templateConfig.printCopy,
        },
      ],
    });
  }
}
