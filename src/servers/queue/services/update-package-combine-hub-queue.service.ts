import { getManager } from 'typeorm';
import { AwbItemAttr } from '../../../shared/orm-entity/awb-item-attr';
import { BagItemAwb } from '../../../shared/orm-entity/bag-item-awb';
import { PodScanInHubBag } from '../../../shared/orm-entity/pod-scan-in-hub-bag';
import { PodScanInHubDetail } from '../../../shared/orm-entity/pod-scan-in-hub-detail';
import { ConfigService } from '../../../shared/services/config.service';
import { DoPodDetailPostMetaQueueService } from './do-pod-detail-post-meta-queue.service';
import { QueueBullBoard } from './queue-bull-board';
import {HubSummaryAwb} from '../../../shared/orm-entity/hub-summary-awb';
import moment= require('moment');
import { UpsertHubSummaryBagSortirQueueService } from './upsert-hub-summary-bag-sortir-queue.service';
import { PinoLoggerService } from '../../../shared/services/pino-logger.service';

// DOC: https://optimalbits.github.io/bull/

export class UpdatePackageCombineHubQueueService {
  public static queue = QueueBullBoard.createQueue.add(
    'update-package-combine-hub-queue',
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
      try {
        const data = job.data;
        // update awb_item_attr
        await AwbItemAttr.update(
          { awbItemAttrId: data.awbItemAttrId },
          {
            bagItemIdLast: data.bagItemId,
            isPackageCombined: true,
            // updatedTime: dateNow,
            // awbStatusIdLast: 4500,
            // userIdLast: data.userId,
          },
        );

        return true;
      } catch (error) {
        console.error(`[update-package-combine-hub-queue] `, error);
        throw error;
      }
      
    });

    this.queue.on('completed', () => {
      // cleans all jobs that completed over 5 seconds ago.
      this.queue.clean(5000);
    });

    this.queue.on('cleaned', function(job, type) {
      PinoLoggerService.log(`Cleaned ${job.length} ${type} jobs`);
    });
  }

  public static async perform(
    awbItemAttrId: string,
    bagItemId: number,
  ) {
    const obj = {
      awbItemAttrId,
      bagItemId,
    };

    return UpdatePackageCombineHubQueueService.queue.add(obj);
  }
}
