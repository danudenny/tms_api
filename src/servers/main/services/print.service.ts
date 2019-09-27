import express = require('express');
import { map } from 'lodash';
import moment = require('moment');

import { PrinterService } from '../../../shared/services/printer.service';
import { RawQueryService } from '../../../shared/services/raw-query.service';
import { RepositoryService } from '../../../shared/services/repository.service';
import { RequestErrorService } from '../../../shared/services/request-error.service';
import { PrintBagItemPayloadQueryVm } from '../models/print-bag-item-payload.vm';
import { PrintDoPodBagPayloadQueryVm } from '../models/print-do-pod-bag-payload.vm';
import { PrintDoPodDeliverPayloadQueryVm } from '../models/print-do-pod-deliver-payload.vm';
import { PrintDoPodPayloadQueryVm } from '../models/print-do-pod-payload.vm';

export class PrintService {
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

    const currentUser = await RepositoryService.user
      .loadById(queryParams.userId)
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
      .loadById(queryParams.branchId)
      .select({
        branchName: true,
      });

    if (!currentUser) {
      RequestErrorService.throwObj({
        message: 'Gerai asal tidak ditemukan',
      });
    }

    const m = moment();
    const jsreportParams = {
      data: doPod,
      meta: {
        currentUserName: currentUser.employee.nickname,
        currentBranchName: currentBranch.branchName,
        date: m.format('DD/MM/YY'),
        time: m.format('HH:mm'),
        totalItems: doPod.doPodDetails.length,
      },
    };

    PrinterService.responseForJsReport({
      res,
      jsreportTemplateName: 'surat-jalan',
      jsreportTemplateData: jsreportParams,
      printerName: 'StrukPrinter',
    });
  }

  public static async printDoPodBagByRequest(
    res: express.Response,
    queryParams: PrintDoPodBagPayloadQueryVm,
  ) {
    const m = moment();
    const dateNow = await m.format('DD/MM/YY');
    const timeNow = await m.format('HH:mm');

    const q = RepositoryService.doPod.findOne();
    q.leftJoin(e => e.doPodDetailBag);
    q.leftJoin(e => e.userDriver.employee);

    const doPod = await q
      .select({
        doPodId: true, // needs to be selected due to do_pod relations are being included
        doPodCode: true,
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
            bag: {
              bagNumber: true,
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

    const bagItemIds = map(doPod.doPodDetailBag, doPodDetail => doPodDetail.bagItem.bagItemId);
    const result = await RawQueryService.query(`SELECT COUNT(1) as cnt FROM bag_item WHERE bag_item_id IN (${bagItemIds.join(',')})`);
    const totalBagItem = result[0].cnt;

    const currentUser = await RepositoryService.user
      .loadById(queryParams.userId)
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
      .loadById(queryParams.branchId)
      .select({
        branchName: true,
      });

    if (!currentUser) {
      RequestErrorService.throwObj({
        message: 'Gerai asal tidak ditemukan',
      });
    }

    const jsreportParams = {
      data: doPod,
      meta: {
        currentUserName: currentUser.employee.nickname,
        currentBranchName: currentBranch.branchName,
        date: dateNow,
        time: timeNow,
        totalItems: totalBagItem,
      },
    };

    PrinterService.responseForJsReport({
      res,
      jsreportTemplateName: 'surat-jalan-gabung-paket',
      jsreportTemplateData: jsreportParams,
      printerName: 'StrukPrinter',
    });
  }

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
              awbNumber: true,
              consigneeName: true,
              consigneeNumber: true,
            },
          },
        },
      })
      .where(e => e.doPodDeliverId, w => w.equals(queryParams.id));

    if (!doPodDeliver) {
      RequestErrorService.throwObj({
        message: 'Surat jalan tidak ditemukan',
      });
    }

    const currentUser = await RepositoryService.user
      .loadById(queryParams.userId)
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
      .loadById(queryParams.branchId)
      .select({
        branchName: true,
      });

    if (!currentUser) {
      RequestErrorService.throwObj({
        message: 'Gerai asal tidak ditemukan',
      });
    }

    const m = moment();
    const jsreportParams = {
      data: doPodDeliver,
      meta: {
        currentUserName: currentUser.employee.nickname,
        currentBranchName: currentBranch.branchName,
        date: m.format('DD/MM/YY'),
        time: m.format('HH:mm'),
        totalItems: doPodDeliver.doPodDeliverDetails.length,
      },
    };

    PrinterService.responseForJsReport({
      res,
      jsreportTemplateName: 'surat-jalan-antar',
      jsreportTemplateData: jsreportParams,
      printerName: 'StrukPrinter',
    });
  }

  public static async printBagItemForStickerByRequest(
    res: express.Response,
    queryParams: PrintBagItemPayloadQueryVm,
  ) {
    const q = RepositoryService.bagItem.findOne();
    q.innerJoin(e => e.bag);
    q.leftJoin(e => e.bag.district);

    const bagItem = await q
      .select({
        bagItemId: true,
        bagId: true,
        bagSeq: true,
        weight: true,
        createdTime: true,
        bag: {
          bagId: true,
          bagNumber: true,
          district: {
            districtName: true,
            districtCode: true,
          },
        },
      })
      .where(e => e.bagItemId, w => w.equals(queryParams.id));

    if (!bagItem) {
      RequestErrorService.throwObj({
        message: 'Gabung paket tidak ditemukan',
      });
    }

    const [{ cnt: bagItemsTotal }] = await RawQueryService.exec(
      `SELECT COUNT(1) as cnt FROM bag_item WHERE bag_id=:bagId`,
      { bagId: bagItem.bagId },
    );

    const currentUser = await RepositoryService.user
      .loadById(queryParams.userId)
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
      .loadById(queryParams.branchId)
      .select({
        branchName: true,
      });

    if (!currentUser) {
      RequestErrorService.throwObj({
        message: 'Gerai asal tidak ditemukan',
      });
    }

    const m = moment();
    const jsreportParams = {
      data: bagItem,
      meta: {
        currentUserName: currentUser.employee.nickname,
        currentBranchName: currentBranch.branchName,
        date: m.format('DD/MM/YY'),
        time: m.format('HH:mm'),
        bagItemsTotal,
      },
    };

    const weightNumberOnly = `${bagItem.weight}`.replace(/\D/gm, '');
    const finalWeightRounded2Decimal = parseFloat(`${bagItem.weight}`).toFixed(
      2,
    );
    const finalBagItemSeq = String(bagItem.bagSeq).padStart(3, '0');
    const finalBagItemBarcodeNumber = `${
      bagItem.bag.bagNumber
    }${finalBagItemSeq}${weightNumberOnly}`;
    const rawTsplPrinterCommands =
      `SIZE 80 mm, 100 mm\n` +
      `SPEED 3\n` +
      `DENSITY 8\n` +
      `DIRECTION 0\n` +
      `OFFSET 0\n` +
      `CLS\n` +
      `TEXT 30,120,"5",0,1,1,0,"GABUNGAN PAKET"\n` +
      `BARCODE 30,200,"128",100,1,0,3,10,"${finalBagItemBarcodeNumber}"\n` +
      `TEXT 30,380,"3",0,1,1,"Koli ke : ${finalBagItemSeq}"\n` +
      `TEXT 30,420,"3",0,1,1,"Berat : ${finalWeightRounded2Decimal} Isi : ${bagItemsTotal}c"\n` +
      `TEXT 30,460,"4",0,1,1,0,"${
        bagItem.bag.district.districtCode
      }"\n` +
      `TEXT 30,510,"5",0,1,1,0,"${
        bagItem.bag.district.districtName
      }"\n` +
      `PRINT 1\n` +
      `EOP`;

    PrinterService.responseForRawCommands({
      res,
      rawCommands: rawTsplPrinterCommands,
      printerName: 'BarcodePrinter',
    });
  }

  public static async printBagItemForPaperByRequest(
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
        createdTime: true,
        bag: {
          bagId: true,
          bagNumber: true,
          district: {
            districtName: true,
            districtCode: true,
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
      .where(e => e.bagItemId, w => w.equals(queryParams.id));

    if (!bagItem) {
      RequestErrorService.throwObj({
        message: 'Gabung paket tidak ditemukan',
      });
    }

    const currentUser = await RepositoryService.user
      .loadById(queryParams.userId)
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
      .loadById(queryParams.branchId)
      .select({
        branchName: true,
      });

    if (!currentUser) {
      RequestErrorService.throwObj({
        message: 'Gerai asal tidak ditemukan',
      });
    }

    const m = moment();
    const jsreportParams = {
      data: bagItem,
      meta: {
        currentUserName: currentUser.employee.nickname,
        currentBranchName: currentBranch.branchName,
        date: m.format('DD/MM/YY'),
        time: m.format('HH:mm'),
      },
    };

    PrinterService.responseForJsReport({
      res,
      jsreportTemplateName: 'surat-jalan-gabungan-sortir-paper',
      jsreportTemplateData: jsreportParams,
      printerName: 'StrukPrinter',
    });
  }
}
