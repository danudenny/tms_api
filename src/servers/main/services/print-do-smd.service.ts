import { RepositoryService } from '../../../shared/services/repository.service';
import { RequestErrorService } from '../../../shared/services/request-error.service';
import { PrinterService } from '../../../shared/services/printer.service';
import express = require('express');
import moment = require('moment');
import { PrintDoSmdPayloadQueryVm } from '../models/print-do-smd-payload.vm';
import { PrintDoSmdDataVm } from '../models/print-do-smd.vm';

export class PrintDoSmdService {
  public static async printDoSmdByRequest(
    res: express.Response,
    queryParams: PrintDoSmdPayloadQueryVm,
  ) {
    const q = RepositoryService.doSmd.findOne();
    q.leftJoin(e => e.doSmdDetails);
    q.leftJoin(e => e.doSmdDetails.doSmdDetailItem);
    q.leftJoin(e => e.doSmdVehicle);

    const doSmd = await q
      .select({
        doSmdId: true, // needs to be selected due to do_smd relations are being included
        doSmdCode: true,
        // description: true,
        doSmdVehicle: {
          employee: {
            // employeeName: true,
            nik: true,
            nickname: true,
          },
        },
        totalBagging: true,
        totalBag: true,
        doSmdDetails: {
          doSmdDetailId: true,
          sealNumber: true,
          branchTo: {
            branchName: true,
          },
          doSmdDetailItem: {
            doSmdDetailItemId: true,
            bagItem: {
              bagItemId: true, // needs to be selected due to bag_item relations are being included
              bagSeq: true,
              weight: true,
              bag: {
                bagNumber: true,
                refRepresentativeCode: true,
              },
            },
            bagType: true,
          },
        },
      })
      .where(e => e.doSmdId, w => w.equals(queryParams.id))
      .andWhere(e => e.doSmdDetails.isDeleted, w => w.isFalse());

    if (!doSmd) {
      RequestErrorService.throwObj({
        message: 'Surat jalan tidak ditemukan',
      });
    }

    this.printDoSmdAndQueryMeta(
      res,
      doSmd as any,
      {
        userId: queryParams.userId,
        branchId: queryParams.branchId,
      },
      {
        printCopy: queryParams.printCopy,
      },
    );
  }

  public static async printDoSmdAndQueryMeta(
    res: express.Response,
    data: Partial<PrintDoSmdDataVm>,
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

    return this.printDoSmd(
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

  public static async printDoSmd(
    res: express.Response,
    data: Partial<PrintDoSmdDataVm>,
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
          templateName: 'surat-muatan-darat',
          templateData: jsreportParams,
          printCopy: templateConfig.printCopy,
        },
      ],
      listPrinterName,
    });
  }
}
