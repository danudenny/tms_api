import moment = require('moment');
import { ConfigService } from '../../../shared/services/config.service';
import { QueueBullBoard } from './queue-bull-board';
import { BagItemAwb } from '../../../shared/orm-entity/bag-item-awb';
import { AWB_STATUS } from '../../../shared/constants/awb-status.constant';
import { SharedService } from '../../../shared/services/shared.service';
import { RawQueryService } from '../../../shared/services/raw-query.service';
import { BAG_STATUS } from '../../../shared/constants/bag-status.constant';
import { BagItemHistory } from '../../../shared/orm-entity/bag-item-history';
import { DoSmdPostAwbHistoryMetaQueueService } from './do-smd-post-awb-history-meta-queue.service';
import {In} from 'typeorm';

// DOC: https://optimalbits.github.io/bull/

export class BagScanDoSmdQueueService {
  public static queue = QueueBullBoard.createQueue.add(
    'bag-scan-do-smd-queue',
    {
      defaultJobOptions: {
        timeout: 0,
        attempts: Math.round(
          (+ConfigService.get('queue.doSmdDetailPostMeta.keepRetryInHours') *
            60 *
            60 *
            1000) /
            +ConfigService.get('queue.doSmdDetailPostMeta.retryDelayMs'),
        ),
        backoff: {
          type: 'fixed',
          delay: ConfigService.get('queue.doSmdDetailPostMeta.retryDelayMs'),
        },
      },
      redis: ConfigService.get('redis'),
      limiter: {
        max: 1000,
        duration: 5000, // on seconds
      },
    },
  );

  public static boot() {
    // NOTE: Concurrency defaults to 1 if not specified.
    this.queue.process(5, async job => {
      // await getManager().transaction(async transactionalEntityManager => {
      // }); // end transaction
      console.log('### SCAN DO SMD JOB ID =========', job.id);
      const data = job.data;
      const tempAwb = [];

      const bagItemsAwb = await BagItemAwb.find({
        where: {
          bagItemId: data.bagItemId ? Number(data.bagItemId) : In(data.arrBagItemId),
          isDeleted: false,
        },
      });

      // UPDATE HISTORY BAG IF REQUESTED
      if (data.isUpdatedHistoryBag) {
        let bagItemIds = null;
        if (data.bagItemId) {
          bagItemIds = [data.bagItemId];
        } else {
          bagItemIds = data.arrBagItemId;
        }
        for (const bagItemIdEach of bagItemIds) {
          const resultbagItemHistory = BagItemHistory.create();
          resultbagItemHistory.bagItemId = bagItemIdEach.toString();
          resultbagItemHistory.userId = data.userId.toString();
          resultbagItemHistory.branchId = data.branchId.toString();
          resultbagItemHistory.historyDate = moment().toDate();
          resultbagItemHistory.bagItemStatusId = BAG_STATUS.IN_HUB.toString();
          resultbagItemHistory.userIdCreated = data.userId;
          resultbagItemHistory.createdTime = moment().toDate();
          resultbagItemHistory.userIdUpdated = data.userId;
          resultbagItemHistory.updatedTime = moment().toDate();
          await BagItemHistory.insert(resultbagItemHistory);
        }
      }

      if (bagItemsAwb && bagItemsAwb.length) {

        for (const itemAwb of bagItemsAwb) {
          if (itemAwb.awbItemId && !tempAwb.includes(itemAwb.awbItemId)) {
            // handle duplicate awb item id
            tempAwb.push(itemAwb.awbItemId);

            DoSmdPostAwbHistoryMetaQueueService.createJobByScanDoSmd(
              Number(itemAwb.awbItemId),
              Number(data.branchId),
              Number(data.userId),
              AWB_STATUS.IN_HUB,
            );
          }
        }
      }
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

  public static async perform(
    bagItemId: number,
    userId: number,
    branchId: number,
    arrBagItemId = [],
    isUpdatedHistoryBag = false,
  ) {
    const obj = {
      bagItemId,
      userId,
      branchId,
      arrBagItemId,
      isUpdatedHistoryBag,
    };

    return BagScanDoSmdQueueService.queue.add(obj);
  }
}