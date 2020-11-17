import moment = require('moment');
import { ConfigService } from '../../../shared/services/config.service';
import { QueueBullBoard } from './queue-bull-board';
import { BagItemAwb } from '../../../shared/orm-entity/bag-item-awb';
import { DoPodDetailPostMetaQueueService } from './do-pod-detail-post-meta-queue.service';
import { AwbItem } from '../../../shared/orm-entity/awb-item';
import { DropoffHubDetailBagging } from '../../../shared/orm-entity/dropoff_hub_detail_bagging';
import { BagRepresentativeItem } from '../../../shared/orm-entity/bag-representative-item';
import { DropoffHubDetailBagRepresentative } from '../../../shared/orm-entity/dropoff_hub_detail_bag_representative';

// DOC: https://optimalbits.github.io/bull/

export class BagRepresentativeDropoffHubQueueService {
  public static queue = QueueBullBoard.createQueue.add(
    'bag-representative-dropoff-hub-queue',
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
      console.log('### SCAN DROP OFF HUB BAG REPRESENTATIVE JOB ID =========', job.id);
      const data = job.data;

      const bagRepresentativeItem = await BagRepresentativeItem.find({
        where: {
          bagRepresentativeId: data.bagRepresentativeId,
          isDeleted: false,
        },
      });

      if (bagRepresentativeItem && bagRepresentativeItem.length) {
        for (const itemRepresentative of bagRepresentativeItem) {
          if (itemRepresentative.awbItemId) {

            // create dropoffDetailBagging
            // =============================================================
            const dropoffDetailBagRepresentative = DropoffHubDetailBagRepresentative.create();
            dropoffDetailBagRepresentative.dropoffHubBagRepresentativeId = data.dropoffHubBagRepresentativeId;
            dropoffDetailBagRepresentative.branchId = data.branchId;
            dropoffDetailBagRepresentative.awbId = itemRepresentative.awbId;
            dropoffDetailBagRepresentative.awbItemId = itemRepresentative.awbItemId;
            dropoffDetailBagRepresentative.awbNumber = itemRepresentative.refAwbNumber;
            dropoffDetailBagRepresentative.userIdCreated = data.userId;
            dropoffDetailBagRepresentative.userIdUpdated = data.userId;
            dropoffDetailBagRepresentative.createdTime = data.timestamp;
            dropoffDetailBagRepresentative.updatedTime = data.timestamp;
            await DropoffHubDetailBagRepresentative.save(dropoffDetailBagRepresentative);

            // NOTE: queue by Bull
            // add awb history with background process
            DoPodDetailPostMetaQueueService.createJobByDropoffBag(
              itemRepresentative.awbItemId,
              data.branchId,
              data.userId,
              data.isSmd,
            );
          }
        } // End Of Loop
      } else {
        console.log('### Data Bag Item Representative :: Not Found!!');
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
    dropoffHubBagRepresentativeId: string,
    bagRepresentativeId: number,
    userId: number,
    branchId: number,
    isSmd = 0,
  ) {
    const obj = {
      dropoffHubBagRepresentativeId,
      bagRepresentativeId,
      userId,
      branchId,
      timestamp: moment().toDate(),
      isSmd,
    };

    return BagRepresentativeDropoffHubQueueService.queue.add(obj);
  }
}
