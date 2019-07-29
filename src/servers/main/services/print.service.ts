import express = require('express');
import moment = require('moment');

import { AuthService } from '../../../shared/services/auth.service';
import { PrinterService } from '../../../shared/services/printer.service';
import { RepositoryService } from '../../../shared/services/repository.service';
import { PrintBagItemPayloadQueryVm } from '../models/print-bag-item-payload.vm';
import { PrintDoPodDeliverPayloadQueryVm } from '../models/print-do-pod-deliver-payload.vm';
import { PrintDoPodPayloadQueryVm } from '../models/print-do-pod-payload.vm';

export class PrintService {
  public static async printDoPodByRequest(
    res: express.Response,
    queryParams: PrintDoPodPayloadQueryVm,
  ) {
    const doPod = await RepositoryService.doPod
      .findOne()
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

    // TODO: Handle if doPod undefined / not found
    // TODO: Handle if doPod.doPodDetails undefined / empty

    const currentUserMeta = AuthService.getAuthData();
    const currentUserPermissionTokenPayload = AuthService.getPermissionTokenPayload();
    const currentUser = await RepositoryService.user
      .loadById(currentUserMeta.userId)
      .select({
        userId: true, // needs to be selected due to users relations are being included
        employee: {
          nickname: true,
        },
      });

    const currentBranch = await RepositoryService.branch
      .loadById(currentUserPermissionTokenPayload.branchId)
      .select({
        branchName: true,
      });

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

  public static async printDoPodDeliverByRequest(
    res: express.Response,
    queryParams: PrintDoPodDeliverPayloadQueryVm,
  ) {
    const doPodDeliver = await RepositoryService.doPodDeliver
      .findOne()
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

    // TODO: Handle if doPodDeliver undefined / not found
    // TODO: Handle if doPodDeliver.doPodDeliverDetails undefined / empty

    const currentUserMeta = AuthService.getAuthData();
    const currentUserPermissionTokenPayload = AuthService.getPermissionTokenPayload();
    const currentUser = await RepositoryService.user
      .loadById(currentUserMeta.userId)
      .select({
        userId: true, // needs to be selected due to users relations are being included
        employee: {
          nickname: true,
        },
      })
      .exec();

    const currentBranch = await RepositoryService.branch
      .loadById(currentUserPermissionTokenPayload.branchId)
      .select({
        branchName: true,
      });

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

  public static async printBagItemByRequest(
    res: express.Response,
    queryParams: PrintBagItemPayloadQueryVm,
  ) {
    const bagItem = await RepositoryService.bagItem
      .findOne()
      .select({
        bagItemId: queryParams.id, // needs to be selected due to do_pod_deliver relations are being included
        bagSeq: true,
        employee: {
          nickname: true,
          nik: true,
        },
        branchNext: {
          branchName: true,
        },
        bagItemAwbs: {
          bagItemAwbId: true,
          awbItem: {
            awbItemId: true,
            awb: {
              awbNumber: true,
              consigneeName: true,
            },
          },
        },
      })
      .where(e => e.bagItemId, w => w.equals(queryParams.id));

    // TODO: Handle if bagItem undefined / not found
    // TODO: Handle if bagItem.bagItemAwbs undefined / empty

    const currentUserMeta = AuthService.getAuthData();
    const currentUserPermissionTokenPayload = AuthService.getPermissionTokenPayload();
    const currentUser = await RepositoryService.user
      .loadById(currentUserMeta.userId)
      .select({
        userId: true, // needs to be selected due to users relations are being included
        employee: {
          nickname: true,
        },
      })
      .exec();

    const currentBranch = await RepositoryService.branch
      .loadById(currentUserPermissionTokenPayload.branchId)
      .select({
        branchName: true,
      });

    const m = moment();
    const jsreportParams = {
      data: bagItem,
      meta: {
        currentUserName: currentUser.employee.nickname,
        currentBranchName: currentBranch.branchName,
        date: m.format('DD/MM/YY'),
        time: m.format('HH:mm'),
        totalItems: bagItem.bagItemAwbs.length,
      },
    };

    PrinterService.responseForJsReport(
      res,
      'surat-jalan-bag-item',
      jsreportParams,
    );
  }
}
