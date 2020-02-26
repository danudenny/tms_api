import { PrintDoPodBagPayloadQueryVm } from '../models/print-do-pod-bag-payload.vm';
import { RepositoryService } from '../../../shared/services/repository.service';
import { RequestErrorService } from '../../../shared/services/request-error.service';
import { PrintDoPodBagDataVm } from '../models/print-do-pod-bag.vm';
import { map } from 'lodash';
import { RawQueryService } from '../../../shared/services/raw-query.service';
import { PrinterService } from '../../../shared/services/printer.service';
import express = require('express');
import moment = require('moment');

export class PrintDoPodBagService {
  public static async printDoPodBagByRequest(
    res: express.Response,
    queryParams: PrintDoPodBagPayloadQueryVm,
  ) {
    const q = RepositoryService.doPod.findOne();
    q.leftJoin(e => e.doPodDetailBag);
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
        doPodDetailBag: {
          doPodDetailBagId: true, // needs to be selected due to do_pod_detail relations are being included
          bagItem: {
            bagItemId: true, // needs to be selected due to bag_item relations are being included
            bagSeq: true,
            weight: true,
            bag: {
              bagNumber: true,
              refRepresentativeCode: true,
            },
          },
        },
      })
      .where(e => e.doPodId, w => w.equals(queryParams.id))
      .andWhere(e => e.doPodDetailBag.isDeleted, w => w.isFalse());

    if (!doPod) {
      RequestErrorService.throwObj({
        message: 'Surat jalan tidak ditemukan',
      });
    }

    this.printDoPodBagAndQueryMeta(res, doPod as any, {
      userId: queryParams.userId,
      branchId: queryParams.branchId,
      templateType: +queryParams.type,
    }, {
      printCopy: queryParams.printCopy,
    });
  }

  public static async printDoPodBagAndQueryMeta(
    res: express.Response,
    data: Partial<PrintDoPodBagDataVm>,
    metaQuery: {
      userId: number;
      branchId: number;
      templateType: number,
    },
    templateConfig: {
      printCopy?: number;
    } = {
      printCopy: 1,
    },
  ) {
    // const bagItemIds = map(data.doPodDetailBag, doPodDetail => doPodDetail.bagItem.bagItemId);
    // const result = await RawQueryService.query(`SELECT COUNT(1) as cnt FROM bag_item WHERE bag_item_id IN (${bagItemIds.join(',')})`);
    // const totalBagItem = result[0].cnt;
    const totalBagItem = data.doPodDetailBag.length;

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

    let printName = '';
    let printColumn = '';
    if (metaQuery.templateType === 1) {
      printName = 'GABUNGAN SORTIR';
      printColumn = 'Gabung Sortir';
    } else if (metaQuery.templateType === 2) {
      printName = 'HUB';
      printColumn = 'Gabung Paket';
    } else {
      printName = 'GERAI';
      printColumn = 'Gabung Paket';
    }

    const currentDate = moment();

    return this.printDoPodBag(res, data, {
      currentUserName: currentUser.employee.nickname,
      currentBranchName: currentBranch.branchName,
      date: currentDate.format('DD/MM/YY'),
      time: currentDate.format('HH:mm'),
      totalItems: totalBagItem,
      printType: printName,
      printCol: printColumn,
    }, templateConfig);
  }

  public static async printDoPodBag(
    res: express.Response,
    data: Partial<PrintDoPodBagDataVm>,
    meta: {
      currentUserName: string;
      currentBranchName: string;
      date: string;
      time: string;
      totalItems: number;
      printType: string,
      printCol: string,
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
        templateName: 'surat-jalan-gabung-paket',
        templateData: jsreportParams,
        printCopy: templateConfig.printCopy,
      }],
    });
  }
}
