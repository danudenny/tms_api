import moment = require('moment');
import { ConfigService } from '../../../shared/services/config.service';
import { QueueBullBoard } from './queue-bull-board';
import { BagItemAwb } from '../../../shared/orm-entity/bag-item-awb';
import { DoPodDetailPostMetaQueueService } from './do-pod-detail-post-meta-queue.service';
import { AwbItem } from '../../../shared/orm-entity/awb-item';
import { DropoffHubDetailBagging } from '../../../shared/orm-entity/dropoff_hub_detail_bagging';

// DOC: https://optimalbits.github.io/bull/

export class BaggingDropoffHubQueueService {
  public static queue = QueueBullBoard.createQueue.add(
    'bagging-dropoff-hub-queue',
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
      console.log('### SCAN DROP OFF HUB BAGGING JOB ID =========', job.id);
      const data = job.data;

      const bagItemsAwb = await BagItemAwb.find({
        where: {
          bagItemId: data.bagItemId,
          isDeleted: false,
        },
      });

      if (bagItemsAwb && bagItemsAwb.length) {
        for (const itemAwb of bagItemsAwb) {
          if (itemAwb.awbItemId) {
            // find awb where awb_item_id
            const awbItem = await AwbItem.findOne({
              where: {
                awbItemId: itemAwb.awbItemId,
                isDeleted: false,
              },
            });
            if (awbItem) {
              // create dropoffDetailBagging
              // =============================================================
              const dropoffDetailBagging = DropoffHubDetailBagging.create();
              dropoffDetailBagging.dropoffHubBaggingId = data.dropoffHubBaggingId;
              dropoffDetailBagging.branchId = data.branchId;
              dropoffDetailBagging.awbId = awbItem.awbId;
              dropoffDetailBagging.awbItemId = itemAwb.awbItemId;
              dropoffDetailBagging.awbNumber = itemAwb.awbNumber;
              dropoffDetailBagging.userIdCreated = data.userId;
              dropoffDetailBagging.userIdUpdated = data.userId;
              dropoffDetailBagging.createdTime = data.timestamp;
              dropoffDetailBagging.updatedTime = data.timestamp;
              await DropoffHubDetailBagging.save(dropoffDetailBagging);

              // NOTE: queue by Bull
              // add awb history with background process
              DoPodDetailPostMetaQueueService.createJobByDropoffBag(
                itemAwb.awbItemId,
                data.branchId,
                data.userId,
                data.isSmd,
              );
            }
          }
        } // end of loop
      } else {
        console.log('### Data Bag Item Awb :: Not Found!!');
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
    dropoffHubBaggingId: string,
    bagItemId: number,
    userId: number,
    branchId: number,
    isSmd = 0,
  ) {
    const obj = {
      dropoffHubBaggingId,
      bagItemId,
      userId,
      branchId,
      timestamp: moment().toDate(),
      isSmd,
    };

    return BaggingDropoffHubQueueService.queue.add(obj);
  }
}
