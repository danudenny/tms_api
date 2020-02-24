import { PrintDoPodPayloadQueryVm } from '../models/print-do-pod-payload.vm';
import { RepositoryService } from '../../../shared/services/repository.service';
import { RequestErrorService } from '../../../shared/services/request-error.service';
import { PrintDoPodDataVm } from '../models/print-do-pod.vm';
import { PrinterService } from '../../../shared/services/printer.service';
import express = require('express');
import moment = require('moment');

export class PrintDoPodService {
  public static async printDoPodByRequest(
    res: express.Response,
    queryParams: PrintDoPodPayloadQueryVm,
  ) {
    const q = RepositoryService.doPod.findOne();
    q.leftJoin(e => e.doPodDetails);
    q.leftJoin(e => e.userDriver.employee);

    const doPod = await q
      .select({
        doPodId: true, // needs to be selected due to do_pod relations are being included
        doPodCode: true,
        description: true,
        userDriver: {
          userId: true,
          employee: {
            nickname: true,
            nik: true,
          },
        },
        branchTo: {
          branchName: true,
        },
        vehicleNumber: true,
        doPodDetails: {
          doPodDetailId: true, // needs to be selected due to do_pod_detail relations are being included
          awbItem: {
            awbItemId: true, // needs to be selected due to awb_item relations are being included
            awb: {
              awbNumber: true,
              consigneeName: true,
              totalWeight: true,
            },
          },
        },
      })
      .where(e => e.doPodId, w => w.equals(queryParams.id));

    if (!doPod) {
      RequestErrorService.throwObj({
        message: 'Surat jalan tidak ditemukan',
      });
    }

    this.printDoPodAndQueryMeta(res, doPod as any, {
      userId: queryParams.userId,
      branchId: queryParams.branchId,
    }, {
      printCopy: queryParams.printCopy,
    });
  }

  public static async printDoPodAndQueryMeta(
    res: express.Response,
    data: Partial<PrintDoPodDataVm>,
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
    const currentUser = await RepositoryService.user
      .loadById(metaQuery.userId)
      .select({
        userId: true, // needs to be selected due to users relations are being included
        employee: {
          nickname: true,
        },
      });

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

    return this.printDoPod(res, data, {
      currentUserName: currentUser.employee.nickname,
      currentBranchName: currentBranch.branchName,
      date: currentDate.format('DD/MM/YY'),
      time: currentDate.format('HH:mm'),
      totalItems: data.doPodDetails.length,
    }, templateConfig);
  }

  public static async printDoPod(
    res: express.Response,
    data: Partial<PrintDoPodDataVm>,
    meta: {
      currentUserName: string;
      currentBranchName: string;
      date: string;
      time: string;
      totalItems: number;
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
      templates: [{
        templateName: 'surat-jalan',
        templateData: jsreportParams,
        printCopy: templateConfig.printCopy,
      }],
    });
  }
}
