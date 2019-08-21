import express = require('express');
import { sumBy } from 'lodash';
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

    const doPod = await q
      .select({
        doPodId: true, // needs to be selected due to do_pod relations are being included
        doPodCode: true,
        employee: {
          nickname: true,
          nik: true,
        },
        branchTo: {
          branchName: true,
        },
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

    PrinterService.responseForJsReport(res, 'surat-jalan', jsreportParams);
  }

  public static async printDoPodBagByRequest(
    res: express.Response,
    queryParams: PrintDoPodBagPayloadQueryVm,
  ) {
    const q = RepositoryService.doPod.findOne();
    q.leftJoin(e => e.doPodDetails);

    const doPod = await q
      .select({
        doPodId: true, // needs to be selected due to do_pod relations are being included
        doPodCode: true,
        employee: {
          nickname: true,
          nik: true,
        },
        branchTo: {
          branchName: true,
        },
        doPodDetails: {
          doPodDetailId: true, // needs to be selected due to do_pod_detail relations are being included
          bagItem: {
            bagItemId: true, // needs to be selected due to bag_item relations are being included
            bagSeq: true,
            bag: {
              bagNumber: true,
            },
            bagItemAwbs: {
              bagItemAwbId: true, // needs to be selected due to bag_item_awb relations are being included
              awbItem: {
                awbItemId: true, // needs to be selected due to awb_item relations are being included
                awb: {
                  awbNumber: true,
                },
              },
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
        totalItems: sumBy(
          doPod.doPodDetails,
          doPodDetail => doPodDetail.bagItem.bagItemAwbs.length,
        ),
      },
    };

    PrinterService.responseForJsReport(
      res,
      'surat-jalan-gabung-paket',
      jsreportParams,
    );
  }

  public static async printDoPodDeliverByRequest(
    res: express.Response,
    queryParams: PrintDoPodDeliverPayloadQueryVm,
  ) {
    const q = RepositoryService.doPodDeliver.findOne();
    q.leftJoin(e => e.doPodDeliverDetails);

    const doPodDeliver = await q
      .select({
        doPodDeliverId: true, // needs to be selected due to do_pod_deliver relations are being included
        doPodDeliverCode: true,
        employee: {
          nickname: true,
          nik: true,
        },
        doPodDeliverDetails: {
          doPodDeliverDetailId: true, // needs to be selected due to do_pod_deliver_detail relations are being included
          awbItem: {
            awbItemId: true, // needs to be selected due to awb_item relations are being included
            awb: {
              awbNumber: true,
              consigneeName: true,
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

    PrinterService.responseForJsReport(
      res,
      'surat-jalan-antar',
      jsreportParams,
    );
  }

  public static async printBagItemForStickerByRequest(
    res: express.Response,
    queryParams: PrintBagItemPayloadQueryVm,
  ) {
    const q = RepositoryService.bagItem.findOne();
    q.innerJoin(e => e.bag);
    q.leftJoin(e => e.bag.representative);

    const bagItem = await q
      .select({
        bagItemId: true,
        bagSeq: true,
        weight: true,
        createdTime: true,
        bag: {
          bagId: true,
          bagNumber: true,
          representative: {
            representativeName: true,
            representativeCode: true,
          },
        },
      })
      .where(e => e.bagItemId, w => w.equals(queryParams.id));

    if (!bagItem) {
      RequestErrorService.throwObj({
        message: 'Gabung paket tidak ditemukan',
      });
    }

    const { cnt: bagItemsTotal } = await RawQueryService.exec(
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

    PrinterService.responseForJsReport(
      res,
      'surat-jalan-gabungan-sortir-sticker',
      jsreportParams,
    );
  }

  public static async printBagItemForPaperByRequest(
    res: express.Response,
    queryParams: PrintBagItemPayloadQueryVm,
  ) {
    const q = RepositoryService.bagItem.findOne();
    q.innerJoin(e => e.bag);
    q.leftJoin(e => e.bag.representative);

    const bagItem = await q
      .select({
        bagItemId: true,
        bagSeq: true,
        weight: true,
        createdTime: true,
        bag: {
          bagId: true,
          bagNumber: true,
          representative: {
            representativeName: true,
            representativeCode: true,
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

    PrinterService.responseForJsReport(
      res,
      'surat-jalan-gabungan-sortir-paper',
      jsreportParams,
    );
  }
}
