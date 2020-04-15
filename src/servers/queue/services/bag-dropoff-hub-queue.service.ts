import moment = require('moment');
import { ConfigService } from '../../../shared/services/config.service';
import { QueueBullBoard } from './queue-bull-board';
import { BagItemAwb } from '../../../shared/orm-entity/bag-item-awb';
import { DoPodDetailPostMetaQueueService } from './do-pod-detail-post-meta-queue.service';
import { DropoffHubDetail } from '../../../shared/orm-entity/dropoff_hub_detail';
import { AwbItem } from '../../../shared/orm-entity/awb-item';

// DOC: https://optimalbits.github.io/bull/

export class BagDropoffHubQueueService {
  public static queue = QueueBullBoard.createQueue.add(
    'bag-dropoff-hub-queue',
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
      console.log('### SCAN DROP OFF HUB JOB ID =========', job.id);
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
              // create dropoffDetail
              // =============================================================
              const dropoffDetail = DropoffHubDetail.create();
              dropoffDetail.dropoffHubId = data.dropoffHubId;
              dropoffDetail.branchId = data.branchId;
              dropoffDetail.awbId = awbItem.awbId;
              dropoffDetail.awbItemId = itemAwb.awbItemId;
              dropoffDetail.awbNumber = itemAwb.awbNumber;
              dropoffDetail.userIdCreated = data.userId;
              dropoffDetail.userIdUpdated = data.userId;
              dropoffDetail.createdTime = data.timestamp;
              dropoffDetail.updatedTime = data.timestamp;
              await DropoffHubDetail.save(dropoffDetail);

              // NOTE: queue by Bull
              // add awb history with background process
              DoPodDetailPostMetaQueueService.createJobByDropoffBag(
                itemAwb.awbItemId,
                data.branchId,
                data.userId,
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
    dropoffHubId: string,
    bagItemId: number,
    userId: number,
    branchId: number,
  ) {
    const obj = {
      dropoffHubId,
      bagItemId,
      userId,
      branchId,
      timestamp: moment().toDate(),
    };

    return BagDropoffHubQueueService.queue.add(obj);
  }
}
