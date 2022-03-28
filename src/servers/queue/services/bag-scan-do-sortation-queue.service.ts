import moment = require('moment');
import { ConfigService } from '../../../shared/services/config.service';
import { QueueBullBoard } from './queue-bull-board';
import { BagItemAwb } from '../../../shared/orm-entity/bag-item-awb';
import { BAG_STATUS } from '../../../shared/constants/bag-status.constant';
import { BagItemHistoryQueueService } from './bag-item-history-queue.service';
import { BagItem } from '../../../shared/orm-entity/bag-item';
import { DoPodDetailPostMetaQueueService } from './do-pod-detail-post-meta-queue.service';

export class BagScanDoSortationQueueService {
  public static queue = QueueBullBoard.createQueue.add(
    'bag-scan-do-sortation-queue',
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
      // redis: ConfigService.get('redis'),
      // limiter: {
      //   max: 1000,
      //   duration: 5000, // on seconds
      // },
    },
  );

  public static boot() {
    this.queue.process(5, async job => {
      console.log('### SCAN DO SORTATION JOB ID =========', job.id);
      const data = job.data;

      BagItemHistoryQueueService.addData(
        data.bagItemId,
        BAG_STATUS.IN_HUB,
        data.branchId,
        data.userId,
      );

      await BagItem.update(
        {bagItemId : data.bagItemId},
        {
          bagItemStatusIdLast: BAG_STATUS.IN_HUB,
          branchIdLast: data.branchId,
          userIdUpdated: data.userId,
          updatedTime: moment().toDate(),
        },
      );

      const bagItemsAwb = await BagItemAwb.find({
        where: {
          bagItemId: data.bagItemId,
          isDeleted: false,
        },
      });

      for (const itemAwb of bagItemsAwb) {
        DoPodDetailPostMetaQueueService.createJobByAwbFilter(
          itemAwb.awbItemId,
          data.branchId,
          data.userId,
        );
      }
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
  ) {
    const obj = {
      bagItemId,
      userId,
      branchId,
    };

    return BagScanDoSortationQueueService.queue.add(obj);
  }
}
