import { getManager } from 'typeorm';
import { PodScanInHubBag } from '../../../shared/orm-entity/pod-scan-in-hub-bag';
import { ConfigService } from '../../../shared/services/config.service';
import { QueueBullBoard } from './queue-bull-board';
import { HubSummaryAwb } from '../../../shared/orm-entity/hub-summary-awb';
import moment= require('moment');

// DOC: https://optimalbits.github.io/bull/

export class UpsertHubSummaryBagSortirQueueService {
  public static queue = QueueBullBoard.createQueue.add(
    'upsert-hub-summary-bag-sortir-queue',
    {
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
    },
  );

  public static boot() {
    // NOTE: Concurrency defaults to 1 if not specified.
    this.queue.process(5, async job => {
      const data = job.data;
      const podScanInHubBag = await PodScanInHubBag.findOne({
        where: { bagItemId: data.bagItemId },
      });
      await getManager().transaction(async transactional => {
        const dateNow = moment().toDate();

          // UPSERT STATUS IN HUB IN AWB SUMMARY
          // Handling case scanin hub to hub using bag sortir
          // when create bag sortir before scanin hub (status in_hub before do_hub)
        const summary = await HubSummaryAwb.find({
          where: {
            awbNumber: data.awbNumber,
          },
        });
        if (summary && summary.length) {
          await transactional.update(
            HubSummaryAwb,
            { awbNumber: data.awbNumber },
            {
              scanDateInHub: dateNow,
              inHub: true,
              bagItemIdIn: data.bagItemId,
              bagIdIn: data.bagId,
              userIdUpdated: data.userId,
              updatedTime: data.timestamp,
            },
          );
        } else {
          const hubSummaryAwb = HubSummaryAwb.create(
            {
              scanDateInHub: dateNow,
              branchId: data.branchId,
              awbNumber: data.awbNumber,
              inHub: true,
              bagItemIdIn: data.bagItemId,
              bagIdIn: data.bagId,
              awbItemId: data.awbItemId,
              userIdCreated: data.userId,
              userIdUpdated: data.userId,
              createdTime: data.timestamp,
              updatedTime: data.timestamp,
            },
          );
          await transactional.insert(HubSummaryAwb, hubSummaryAwb);
        }

      }); // end transaction
      return true;
    });

    this.queue.on('completed', () => {
      // cleans all jobs that completed over 5 seconds ago.
      this.queue.clean(5000);
    });

    this.queue.on('cleaned', function(job, type) {
      console.log('Cleaned %s %s jobs', job.length, type);
    });
  }

  public static async perform(
    bagId: number,
    bagItemId: number,
    bagNumber: string,
    awbItemId: number,
    awbNumber: string,
    userId: number,
    branchId: number,
    timestamp: Date,
  ) {
    const obj = {
      bagId,
      bagItemId,
      bagNumber,
      awbItemId,
      awbNumber,
      userId,
      branchId,
      timestamp,
    };

    return UpsertHubSummaryBagSortirQueueService.queue.add(obj);
  }
}
