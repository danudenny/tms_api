import { PrintDoPodDeliverPayloadQueryVm } from '../models/print-do-pod-deliver-payload.vm';
import { RepositoryService } from '../../../shared/services/repository.service';
import { RequestErrorService } from '../../../shared/services/request-error.service';
import { PrintDoPodDeliverDataVm } from '../models/print-do-pod-deliver.vm';
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

    this.printDoPodDeliverAndQueryMeta(
      res,
      doPodDeliver as any,
      {
        userId: queryParams.userId,
        branchId: queryParams.branchId,
      },
      {
        printCopy: queryParams.printCopy,
      },
    );
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
    // #region get user login and branch login
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
    // #endregion

    const currentDate = moment();
    let totalAllCod = 0;

    // sum totalCodValue from object
    // loop data and sum data totalCodValue
    if (data && data.doPodDeliverDetails) {
      data.doPodDeliverDetails.map(function(doPod) {
        if (
          doPod &&
          doPod.awbItem &&
          doPod.awbItem.awb &&
          doPod.awbItem.awb.totalCodValue
        ) {
          totalAllCod += Number(doPod.awbItem.awb.totalCodValue);
        }
      });
    }

    return this.printDoPodDeliver(
      res,
      data,
      {
        currentUserName: currentUser.employee.nickname,
        currentBranchName: currentBranch.branchName,
        date: currentDate.format('DD/MM/YY'),
        time: currentDate.format('HH:mm'),
        totalItems: data.doPodDeliverDetails.length,
        totalCod: totalAllCod,
      },
      templateConfig,
    );
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

    const listPrinterName = ['BarcodePrinter', 'StrukPrinter'];
    PrinterService.responseForJsReport({
      res,
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
      listPrinterName,
    });
  }
}
