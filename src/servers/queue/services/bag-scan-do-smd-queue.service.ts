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

// DOC: https://optimalbits.github.io/bull/

export class BagScanDoSmdQueueService {
  public static queue = QueueBullBoard.createQueue.add(
    'bag-scan-out-branch-smd-queue',
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
      const tempBag = [];

      for (const item of data.bagItemIds) {
        // handle duplicate bag_item_id
        if (tempBag.includes(item)) {
          continue;
        }
        tempBag.push(item);

        const bagItemsAwb = await BagItemAwb.find({
          select: ['awbItemId'],
          where: {
            bagItemId: item,
            isDeleted: false,
          },
        });

        if (bagItemsAwb && bagItemsAwb.length) {
          const resultbagItemHistory = BagItemHistory.create();
          resultbagItemHistory.bagItemId = item.toString();
          resultbagItemHistory.userId = data.userId.toString();
          resultbagItemHistory.branchId = data.branchId.toString();
          resultbagItemHistory.historyDate = moment().toDate();
          resultbagItemHistory.bagItemStatusId = BAG_STATUS.IN_HUB.toString();
          resultbagItemHistory.userIdCreated = data.userId;
          resultbagItemHistory.createdTime = moment().toDate();
          resultbagItemHistory.userIdUpdated = data.userId;
          resultbagItemHistory.updatedTime = moment().toDate();
          await BagItemHistory.insert(resultbagItemHistory);

          for (const itemAwb of bagItemsAwb) {
            if (itemAwb.awbItemId && !tempAwb.includes(itemAwb.awbItemId)) {
              // handle duplicate awb item id
              tempAwb.push(itemAwb.awbItemId);

              DoSmdPostAwbHistoryMetaQueueService.createJobByScanDoSmd(
                itemAwb.awbItemId,
                data.branchId,
                data.userId,
                AWB_STATUS.IN_HUB,
              );
            }
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
    bagItemIds: any,
    userId: number,
    branchId: number,
  ) {
    const obj = {
      bagItemIds,
      userId,
      branchId,
    };

    return BagScanDoSmdQueueService.queue.add(obj);
  }
}
