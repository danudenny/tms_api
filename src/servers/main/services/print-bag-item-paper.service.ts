import { RepositoryService } from '../../../shared/services/repository.service';
import { RequestErrorService } from '../../../shared/services/request-error.service';
import express = require('express');
import moment = require('moment');
import { PrintBagItemPaperDataVm } from '../models/print-bag-item-paper.vm';
import { PrinterService } from '../../../shared/services/printer.service';
import { PrintBagItemPayloadQueryVm } from '../models/print-bag-item-payload.vm';

export class PrintBagItemPaperService {
  public static async printBagItemPaperByRequest(
    res: express.Response,
    queryParams: PrintBagItemPayloadQueryVm,
  ) {
    const q = RepositoryService.bagItem.findOne();
    q.innerJoin(e => e.bag);
    q.leftJoin(e => e.bag.district);

    const bagItem = await q
      .select({
        bagItemId: true,
        bagSeq: true,
        weight: true,
        bag: {
          bagId: true,
          bagNumber: true,
          branch: {
            branchName: true,
            branchCode: true,
          },
        },
        bagItemAwbs: {
          bagItemAwbId: true,
          awbItem: {
            awbItemId: true,
            awb: {
              awbNumber: true,
              consigneeName: true,
              consigneeNumber: true,
              totalWeightFinalRounded: true,
            },
          },
        },
      })
      .where(e => e.bagItemId, w => w.equals(queryParams.id))
      .andWhere(e => e.bagItemAwbs.isDeleted, w => w.isFalse());

    if (!bagItem) {
      RequestErrorService.throwObj({
        message: 'Gabung paket tidak ditemukan',
      });
    }
    let newBagSeq = bagItem.bagSeq.toString();
    if (bagItem.bagSeq.toString().length < 3) {
      newBagSeq = '0'.repeat(3 - bagItem.bagSeq.toString().length) + newBagSeq;
    }
    bagItem.bag.bagNumber = bagItem.bag.bagNumber + newBagSeq;
    this.printBagItemPaperAndQueryMeta(res, bagItem as any, {
      userId: queryParams.userId,
      branchId: queryParams.branchId,
    });
  }

  public static async printBagItemPaperAndQueryMeta(
    res: express.Response,
    data: Partial<PrintBagItemPaperDataVm>,
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
      .loadById(Number(metaQuery.userId))
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
      .loadById(Number(metaQuery.branchId))
      .select({
        branchName: true,
      });

    if (!currentBranch) {
      RequestErrorService.throwObj({
        message: 'Gerai asal tidak ditemukan',
      });
    }

    const currentDate = moment();

    return this.printBagItemPaper(
      res,
      data,
      {
        currentUserName: currentUser.employee.nickname,
        currentBranchName: currentBranch.branchName,
        date: currentDate.format('DD/MM/YY'),
        time: currentDate.format('HH:mm'),
      },
      templateConfig,
    );
  }

  public static async printBagItemPaper(
    res: express.Response,
    data: Partial<PrintBagItemPaperDataVm>,
    meta: {
      currentUserName: string;
      currentBranchName: string;
      date: string;
      time: string;
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
          templateName: 'surat-jalan-gabungan-sortir-paper',
          templateData: jsreportParams,
        },
      ],
      listPrinterName,
    });
  }
}
