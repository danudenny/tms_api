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
    awbItemAttr: AwbItemAttr,
    userId: number,
    branchIdCurrent: number,
  ) {
    // TODO: check branch last (isHub) ?
    const autoAwbStatus = [
      {
        awbStatusId: AWB_STATUS.OUT_BRANCH, branchId: awbItemAttr.branchIdLast,
      },
      {
        awbStatusId: AWB_STATUS.IN_BRANCH, branchId: branchIdCurrent,
      },
    ];

    await getManager().transaction(async transactionEntityManager => {
      const awbHistories: AwbHistory[] = [];
      for (const item of autoAwbStatus) {
        const autoAwbHistory = this.createObjAwbHistory(
          awbItemAttr,
          userId,
          item.awbStatusId,
          item.branchId,
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
    awbItemAttr: AwbItemAttr,
    userId: number,
    branchIdCurrent: number,
    isHub: boolean = false,
  ) {
    // TODO: check branch last (isHub) ?
    let statusOut = AWB_STATUS.OUT_BRANCH;
    let statusIn = AWB_STATUS.IN_BRANCH;

    if (isHub) {
      statusOut = AWB_STATUS.OUT_HUB;
      statusIn = AWB_STATUS.IN_HUB;
    }

    const autoAwbStatus = [
      {
        awbStatusId: statusOut, branchId: awbItemAttr.branchIdLast,
      },
      {
        awbStatusId: statusIn, branchId: branchIdCurrent,
      },
    ];

    await getManager().transaction(async transactionEntityManager => {
      const awbHistories: AwbHistory[] = [];
      for (const item of autoAwbStatus) {
        const autoAwbHistory = this.createObjAwbHistory(
          awbItemAttr,
          userId,
          item.awbStatusId,
          item.branchId,
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

  // IN BRANCH/ HUB
  // ====================
  // 1 A OUT == LAST Status
  // 2 A IN
  // 2 A OUT
  // 2 B IN =============

  static async awbScanIn(
    awbItemAttr: AwbItemAttr,
    userId: number,
    branchIdCurrent: number,
    isHub: boolean = false,
  ) {
    // TODO: check branch last (isHub) ?
    let statusOut = AWB_STATUS.OUT_BRANCH;
    let statusIn = AWB_STATUS.IN_BRANCH;

    if (isHub) {
      statusOut = AWB_STATUS.OUT_HUB;
      statusIn = AWB_STATUS.IN_HUB;
    }

    const autoAwbStatus = [
      {
        awbStatusId: statusIn, branchId: awbItemAttr.branchIdLast,
      },
      {
        awbStatusId: statusOut, branchId: awbItemAttr.branchIdLast,
      },
    ];

    await getManager().transaction(async transactionEntityManager => {
      const awbHistories: AwbHistory[] = [];
      for (const item of autoAwbStatus) {
        const autoAwbHistory = this.createObjAwbHistory(
          awbItemAttr,
          userId,
          item.awbStatusId,
          item.branchId,
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
  }

  private static createObjAwbHistory(
    awbItemAttr: AwbItemAttr,
    userId: number,
    awbStatusId: number,
    branchId: number,
  ) {
    // TODO: need refactoring
    return AwbHistory.create({
      awbItemId: awbItemAttr.awbItemId,
      awbId: awbItemAttr.awbId,
      refAwbNumber: awbItemAttr.awbNumber,
      userId,
      branchId,
      employeeIdDriver: null,
      historyDate: moment().toDate(),
      awbStatusId,
      isSystemGenereted: true,
      awbHistoryIdPrev: awbItemAttr.awbHistoryIdLast,
      userIdCreated: userId,
      userIdUpdated: userId,
    });
  }
}
