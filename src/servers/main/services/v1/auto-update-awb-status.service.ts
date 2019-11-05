import { getManager } from 'typeorm';
import { AwbItemAttr } from '../../../../shared/orm-entity/awb-item-attr';
import { AwbHistory } from '../../../../shared/orm-entity/awb-history';
import moment = require('moment');
import { AWB_STATUS } from '../../../../shared/constants/awb-status.constant';

export class AutoUpdateAwbStatusService {
  constructor() {}

  // NOTE: AUTO Update Awb Status for ANT
  // ====================
  // 1 A IN == LAST Status
  // 2 A OUT
  // 2 B IN
  // 2 B ANT ============

  static async awbDeliver(
    awbItemId: number,
    userId: number,
    branchIdCurrent: number,
    branchIdLast: number,
    awbHistoryIdLast: number,
  ) {
    // TODO: check branch last (isHub) ?
    const autoAwbStatus = [
      {
        awbStatusId: AWB_STATUS.OUT_BRANCH, branchId: branchIdLast,
      },
      {
        awbStatusId: AWB_STATUS.IN_BRANCH, branchId: branchIdCurrent,
      },
    ];
    await getManager().transaction(async transactionEntityManager => {
      const awbHistories: AwbHistory[] = [];
      for (const item of autoAwbStatus) {
        const autoAwbHistory = this.createObjAwbHistory(
          awbItemId,
          item.awbStatusId,
          userId,
          item.branchId,
          awbHistoryIdLast,
        );
        awbHistories.push(autoAwbHistory);
      }

      // NOTE: Insert Data awb history
      if (awbHistories.length) {
        await transactionEntityManager.insert(
          AwbHistory,
          awbHistories,
        );
      }
    });
    return true;
  }

  // NOTE: AUTO Update Awb Status for OUT BRANCH/HUB
  // ===================
  // 1 A IN == LAST Status
  // 2 A OUT
  // 2 B IN
  // 2 B OUT ===========
  static async awbScanOut(
    isHub: boolean = false,
  ) {

  }

  // IN BRANCH/ HUB
  // ====================
  // 1 A OUT == LAST Status
  // 2 A IN
  // 2 A OUT
  // 2 B IN =============

  static async awbScanIn(
    isHub: boolean = false,
  ) {

  }

  private static createObjAwbHistory(
    awbItemId: number,
    awbStatusId: number,
    userId: number,
    branchId: number,
    awbHistoryIdLast: number,
  ) {
    return AwbHistory.create({
      awbItemId,
      userId,
      branchId,
      employeeIdDriver: null,
      historyDate: moment().toDate(),
      awbStatusId,
      awbHistoryIdPrev: awbHistoryIdLast,
      userIdCreated: userId,
      userIdUpdated: userId,
    });
  }
}
