import moment = require('moment');

import { BAG_STATUS } from '../../../shared/constants/bag-status.constant';
import { BagItem } from '../../../shared/orm-entity/bag-item';
import { BagItemAwb } from '../../../shared/orm-entity/bag-item-awb';
import { ConfigService } from '../../../shared/services/config.service';
import { OrionRepositoryService } from '../../../shared/services/orion-repository.service';
import { BagItemHistoryQueueService } from './bag-item-history-queue.service';
import { DoPodDetailPostMetaQueueService } from './do-pod-detail-post-meta-queue.service';
import { QueueBullBoard } from './queue-bull-board';
import { UpsertHubSummaryBagSortirQueueService } from './upsert-hub-summary-bag-sortir-queue.service';

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
        { bagItemId: data.bagItemId },
        {
          bagItemStatusIdLast: BAG_STATUS.IN_HUB,
          branchIdLast: data.branchId,
          userIdUpdated: data.userId,
          updatedTime: moment().toDate(),
        },
      );

      const repo = new OrionRepositoryService(BagItemAwb, 'bia');
      const q = repo.findAllRaw();
      q.selectRaw(
        ['bia.awb_item_id', 'awbItemId'],
        ['bia.awb_number', 'awbNumber'],
        ['bi.bag_id', 'bagId'],
        ['bi.bag_item_id', 'bagItemId'],
        ['b.bag_number', 'bagNumber'],
      )
        .innerJoin(e => e.bagItem, 'bi', j =>
          j.andWhere(e => e.isDeleted, w => w.isFalse()),
        )
        .innerJoin(e => e.bagItem.bag, 'b', j =>
          j.andWhere(e => e.isDeleted, w => w.isFalse()),
        )
        .andWhere(e => e.bagItemId, w => w.equals(data.bagItemId))
        .andWhere(e => e.isDeleted, w => w.isFalse());

      const bagItemsAwb = await q.exec();

      for (const itemAwb of bagItemsAwb) {
        DoPodDetailPostMetaQueueService.createJobByAwbFilter(
          itemAwb.awbItemId,
          data.branchId,
          data.userId,
        );
        UpsertHubSummaryBagSortirQueueService.perform(
          itemAwb.bagId,
          itemAwb.bagItemId,
          itemAwb.bagNumber,
          itemAwb.awbItemId,
          itemAwb.awbNumber,
          data.userId,
          data.branchId,
          moment().toDate(),
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
