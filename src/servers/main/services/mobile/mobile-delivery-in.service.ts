// #region import
import { Injectable, Logger } from '@nestjs/common';
import moment = require('moment');

import { BagTrouble } from '../../../../shared/orm-entity/bag-trouble';
import { AuthService } from '../../../../shared/services/auth.service';
import { CustomCounterCode } from '../../../../shared/services/custom-counter-code.service';
import { WebScanInValidateBranchVm} from '../../models/web-scanin.vm';
import { PodScanInBranch } from '../../../../shared/orm-entity/pod-scan-in-branch';
import { PodScanInBranchBag } from '../../../../shared/orm-entity/pod-scan-in-branch-bag';
import { BagService } from '../v1/bag.service';

// #endregion

@Injectable()
export class MobileDeliveryInService {
  constructor() {}

  static async scanInValidateBranch(payload: WebScanInValidateBranchVm): Promise<any> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    const timeNow = moment().toDate();

    if (payload.bagNumberDetail && payload.bagNumberDetail.length) {
      for (const item of payload.bagNumberDetail) {
        const bagData = await BagService.validBagNumber(item.bagNumber);
        if (bagData) {
          // NOTE: update data pod scan in branch bag
          const podScanInBag = await PodScanInBranchBag.findOne({
            where: {
              podScanInBranchId: payload.podScanInBranchId,
              bagId: bagData.bagId,
              bagItemId: bagData.bagItemId,
              isDeleted: false,
            },
          });
          if (podScanInBag) {
            const totalDiff = item.totalAwbInBag - item.totalAwbScan;
            PodScanInBranchBag.update(podScanInBag.podScanInBranchBagId, {
              totalAwbScan: item.totalAwbScan,
              notes: payload.notes,
              totalDiff,
            });
          }
          // NOTE: add to bag trouble
          const bagTroubleCode = await CustomCounterCode.bagTrouble(timeNow);
          const bagTrouble = BagTrouble.create({
            bagNumber: item.bagNumber,
            bagTroubleCode,
            bagTroubleStatus: 100,
            bagStatusId: 2000,
            employeeId: authMeta.employeeId,
            branchId: permissonPayload.branchId,
          });
          await BagTrouble.save(bagTrouble);
        }
      }
    }

    // TODO: update data podScanInBranch
    const podScanInBranch = await PodScanInBranch.findOne({
      where: {
        podScanInBranchId: payload.podScanInBranchId,
        isDeleted: false,
      },
    });

    if (podScanInBranch) {
      PodScanInBranch.update(payload.podScanInBranchId, {
        transactionStatusId: 700,
      });
    }

    return { status: 'ok' };
  }
}
