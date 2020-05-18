import { getManager } from 'typeorm';
import { AwbItemAttr } from '../../../shared/orm-entity/awb-item-attr';
import { BagItemAwb } from '../../../shared/orm-entity/bag-item-awb';
import { PodScanInHubBag } from '../../../shared/orm-entity/pod-scan-in-hub-bag';
import { PodScanInHubDetail } from '../../../shared/orm-entity/pod-scan-in-hub-detail';
import { ConfigService } from '../../../shared/services/config.service';
import { DoPodDetailPostMetaQueueService } from './do-pod-detail-post-meta-queue.service';
import { QueueBullBoard } from './queue-bull-board';

// DOC: https://optimalbits.github.io/bull/

export class CreateBagAwbScanHubQueueService {
  public static queue = QueueBullBoard.createQueue.add(
    'create-bag-awb-scan-hub-queue',
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
      await getManager().transaction(async transactional => {
        // Handle awb scan
        const awbItemAttr = await AwbItemAttr.findOne({
          where: { awbItemId: data.awbItemId, isDeleted: false },
        });

        if (awbItemAttr) {
          // update awb_item_attr
          await transactional.update(AwbItemAttr,
            { awbItemAttrId: awbItemAttr.awbItemAttrId },
            {
              bagItemIdLast: data.bagItemId,
              updatedTime: data.timestamp,
              isPackageCombined: true,
              awbStatusIdLast: 4500,
              userIdLast: data.userId,
            },
          );

          // INSERT INTO TABLE BAG ITEM AWB
          const bagItemAwbDetail = BagItemAwb.create({
            bagItemId: data.bagItemId,
            awbNumber: data.awbNumber,
            weight: data.totalWeight,
            awbItemId: data.awbItemId,
            userIdCreated: data.userId,
            createdTime: data.timestamp,
            updatedTime: data.timestamp,
            userIdUpdated: data.userId,
            isSortir: true,
          });
          await transactional.insert(BagItemAwb, bagItemAwbDetail);

          // insert into pod scan in hub detail
          const podScanInHubDetailData = PodScanInHubDetail.create({
            podScanInHubId: data.podScanInHubId,
            bagId: data.bagId,
            bagItemId: data.bagItemId,
            bagNumber: data.bagNumber,
            awbItemId: data.awbItemId,
            awbId: data.awbId,
            awbNumber: data.awbNumber,
            userIdCreated: data.userId,
            userIdUpdated: data.userId,
            createdTime: data.timestamp,
            updatedTime: data.timestamp,
          });
          await transactional.insert(PodScanInHubDetail, podScanInHubDetailData);

          // Update Pod scan in hub bag
          const podScanInHubBag = await PodScanInHubBag.findOne({
            where: { bagItemId: data.bagItemId },
          });
          if (podScanInHubBag) {
            await transactional.update(
              PodScanInHubBag,
              {
                podScanInHubBagId: podScanInHubBag.podScanInHubBagId,
              },
              {
                totalAwbItem: podScanInHubBag.totalAwbItem += 1,
                totalAwbScan: podScanInHubBag.totalAwbScan += 1,
              },
            );
          }

          // update status awb
          DoPodDetailPostMetaQueueService.createJobByAwbFilter(
            data.awbItemId,
            data.branchId,
            data.userId,
          );
        } else {
          console.error('## Gab Sortir :: Not Found Awb Number :: ', data);
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
    podScanInHubId: string,
    totalWeight: number,
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
      podScanInHubId,
      totalWeight,
      userId,
      branchId,
      timestamp,
    };

    return CreateBagAwbScanHubQueueService.queue.add(obj);
  }
}
