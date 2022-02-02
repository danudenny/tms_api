import moment = require('moment');
import { ConfigService } from '../../../shared/services/config.service';
import { BagItemHistory } from '../../../shared/orm-entity/bag-item-history';
import { QueueBullBoard } from './queue-bull-board';
import { getManager } from 'typeorm';
import { BAG_STATUS } from '../../../shared/constants/bag-status.constant';
import { BagItemAwb } from '../../../shared/orm-entity/bag-item-awb';
import { AwbHistory } from '../../../shared/orm-entity/awb-history';
import { AwbItemAttr } from '../../../shared/orm-entity/awb-item-attr';
import { AWB_STATUS } from '../../../shared/constants/awb-status.constant';
import { SharedService } from '../../../shared/services/shared.service';
import { BagItem } from '../../../shared/orm-entity/bag-item';

// Update bag item status after confirming do mutation
export class DoMutationQueueService {
  public static queue = QueueBullBoard.createQueue.add('do-mutation-queue', {
    defaultJobOptions: {
      timeout: 0,
      attempts: Math.round(
        (+ConfigService.get('queue.doPodDetailPostMeta.keepRetryInHours') *
          60 *
          60 *
          1000) /
          +ConfigService.get('queue.doPodDetailPostMeta.retryDelayMs'),
      ),
      backoff: {
        type: 'fixed',
        delay: ConfigService.get('queue.doPodDetailPostMeta.retryDelayMs'),
      },
    },
    limiter: {
      max: 1000,
      duration: 5000, // on seconds
    },
  });

  public static boot() {
    this.queue.process(5, async job => {
      const { bagItemId, userId, branchId, branchIdTo } = job.data;
      await getManager().transaction(async transactionalEntityManager => {
        // get awb
        const bagItemsAwb = await BagItemAwb.find({
          where: {
            bagItemId,
            isDeleted: false,
          },
        });
        let branchName = 'Kantor Pusat';
        const branch = await SharedService.getDataBranchCity(branchId);
        if (branch) {
          branchName = branch.branchName;
        }
        const tempAwb = [];
        const promises = [];
        const now = moment().toDate();
        const nextMinute = moment()
          .add(1, 'minutes')
          .toDate();
        for (const bagItemAwb of bagItemsAwb) {
          if (bagItemAwb.awbItemId && !tempAwb.includes(bagItemAwb.awbItemId)) {
            tempAwb.push(bagItemAwb.awbItemId);
            const awbItemAttr = await AwbItemAttr.findOne({
              where: {
                awbItemId: bagItemAwb.awbItemId,
                isDeleted: false,
              },
            });
            if (awbItemAttr) {
              promises.push(
                DoMutationQueueService.insertAwbHistory({
                  bagItemAwb,
                  awbItemAttr,
                  userId,
                  branchId,
                  now,
                  nextMinute,
                  branchName,
                  branch,
                  branchIdTo,
                }),
              );
            }
          }
        }
        await Promise.all(promises);

        // insert history in line haul
        const inHistory = BagItemHistory.create();
        inHistory.bagItemId = bagItemId.toString();
        inHistory.userId = userId;
        inHistory.branchId = branchId;
        inHistory.historyDate = now;
        inHistory.bagItemStatusId = BAG_STATUS.IN_LINE_HAUL.toString();
        inHistory.userIdCreated = userId;
        inHistory.userIdUpdated = userId;
        inHistory.createdTime = now;
        inHistory.updatedTime = now;
        await BagItemHistory.insert(inHistory);
        // insert history out line haul
        const outHistory = { ...inHistory } as BagItemHistory;
        outHistory.bagItemStatusId = BAG_STATUS.OUT_LINE_HAUL.toString();
        outHistory.historyDate = nextMinute;
        outHistory.createdTime = nextMinute;
        outHistory.updatedTime = nextMinute;
        await BagItemHistory.insert(outHistory);
        await BagItem.update(
          { bagItemId, isDeleted: false },
          {
            bagItemStatusIdLast: BAG_STATUS.OUT_LINE_HAUL,
            bagItemHistoryId: Number(outHistory.bagItemHistoryId),
            userIdUpdated: userId,
            updatedTime: nextMinute,
          },
        );
      }); // end transaction
      return true;
    });

    this.queue.on('completed', job => {
      // cleans all jobs that completed over 5 seconds ago.
      this.queue.clean(5000);
      console.log(`Job with id ${job.id} has been completed`);
    });

    this.queue.on('cleaned', function(job, type) {
      console.log('Cleaned %s %s jobs', job.length, type);
    });
  }

  public static async addData(
    bagItemId: number,
    userId: string,
    branchId: string,
    branchIdTo: string,
  ) {
    const obj = {
      bagItemId,
      userId,
      branchId,
      branchIdTo,
    };

    return DoMutationQueueService.queue.add(obj);
  }

  private static async insertAwbHistory(data) {
    const {
      bagItemAwb,
      awbItemAttr,
      userId,
      branchId,
      now,
      nextMinute,
      branchName,
      branch,
      branchIdTo,
    } = data;
    const awbInHistory = {
      awbItemId: bagItemAwb.awbItemId,
      refAwbNumber: awbItemAttr.awbNumber,
      userId,
      branchId,
      employeeIdDriver: null,
      historyDate: now,
      awbStatusId: AWB_STATUS.IN_LINE_HAUL,
      awbHistoryIdPrev: awbItemAttr.awbHistoryIdLast,
      userIdCreated: userId,
      userIdUpdated: userId,
      noteInternal: `Paket dalam ${branchName} - Mutasi`,
      notePublic: `Paket dalam ${branchName}`,
      receiverName: null,
      awbNote: 'Mutasi Line Haul',
      branchIdNext: branchIdTo,
      latitude: branch.latitude,
      longitude: branch.longitude,
      reasonId: null,
      reasonName: '',
      location: null,
      createdTime: now,
      updatedTime: now,
    };
    // insert awb IN_LINE_HAUL status history first
    const awbInHistoryObj = await AwbHistory.create(awbInHistory).save();
    // then insert OUT_LINE_HAUL status history
    const awbOutHistory = {
      ...awbInHistory,
      awbStatusId: AWB_STATUS.OUT_LINE_HAUL,
      awbHistoryIdPrev: awbInHistoryObj.awbHistoryId,
      noteInternal: `Paket keluar dari ${branchName} - Mutasi`,
      notePublic: `Paket keluar dari ${branchName}`,
      historyDate: nextMinute,
      createdTime: nextMinute,
      updatedTime: nextMinute,
    };
    await AwbHistory.create(awbOutHistory).save();
  }
}
