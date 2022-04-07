import moment = require('moment');
import { ConfigService } from '../../../shared/services/config.service';
import { QueueBullBoard } from './queue-bull-board';
import { BagItemAwb } from '../../../shared/orm-entity/bag-item-awb';
import { DoPodDetailPostMetaQueueService } from './do-pod-detail-post-meta-queue.service';
import { DropoffHubDetail } from '../../../shared/orm-entity/dropoff_hub_detail';
import { AwbItem } from '../../../shared/orm-entity/awb-item';
import { HubSummaryAwb } from '../../../shared/orm-entity/hub-summary-awb';
import { RawQueryService } from '../../../shared/services/raw-query.service';
import { getManager } from 'typeorm';
import { UpsertHubSummaryAwbQueueService } from './upsert-hub-summary-awb-queue.service';


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
      try {
        console.log('### SCAN DROP OFF HUB JOB ID =========', job.id);
        const data = job.data;

        const dateNow = moment().format('YYYY-MM-DD HH:mm:ss');
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

                // HANDLING SCANIN HUB-TO-HUB WHERE STATUS IN_HUB BEFORE DO_HUB
                // if (data.isSortir) {
                //   // UPDATE STATUS DO HUB IN AWB SUMMARY
                //   await HubSummaryAwb.update(
                //     { awbNumber: itemAwb.awbNumber },
                //     {
                //       scanDateDoHub: dateNow,
                //       doHub: true,
                //       userIdUpdated: data.userId,
                //       updatedTime: data.timestamp,
                //     },
                //   );
                // } else {
                //   // CREATE STATUS DO HUB IN AWB SUMMARY
                //   const hubSummaryAwb = HubSummaryAwb.create(
                //     {
                //       scanDateDoHub: dateNow,
                //       branchId: data.branchId,
                //       awbNumber: itemAwb.awbNumber,
                //       doHub: true,
                //       bagItemIdDo: data.bagItemId,
                //       bagIdDo: data.bagId,
                //       awbItemId: itemAwb.awbItemId,
                //       userIdCreated: data.userId,
                //       userIdUpdated: data.userId,
                //       createdTime: data.timestamp,
                //       updatedTime: data.timestamp,
                //     },
                //   );
                //   await HubSummaryAwb.insert(hubSummaryAwb);
                // }
                //

                // NOTE: queue by Bull
                // add awb history with background process
                console.log('### SCAN DROP OFF HUB AWB HISTORY =========', itemAwb.awbNumber);
                DoPodDetailPostMetaQueueService.createJobByDropoffBag(
                  itemAwb.awbItemId,
                  data.branchId,
                  data.userId,
                  data.isSmd,
                );

                // await getManager().transaction(async transactional => {
                const upsertRawHubSummaryAwbSql = `insert into hub_summary_awb (awb_number, scan_date_do_hub,do_hub, bag_item_id_do, bag_id_do, awb_item_id, user_id_updated, updated_time, branch_id,user_id_created, created_time)
                            values ('${escape(itemAwb.awbNumber)}', '${dateNow}', true, ${data.bagItemId}, ${data.bagId}, ${itemAwb.awbItemId}, ${data.userId}, '${dateNow}', ${data.branchId}, ${data.userId}, '${dateNow}')
                            ON CONFLICT (awb_number,branch_id) DO UPDATE SET do_hub = true, scan_date_do_hub = '${dateNow}', user_id_updated=${data.userId}, updated_time='${dateNow}';`;
              
                //   await transactional.query(upsertRawHubSummaryAwbSql);
                // });

                // run queue upsert raw summary awb
                console.log('### SCAN DROP OFF HUB UPSERT HUB SUMMARY =========', itemAwb.awbNumber);
                console.log('### SCAN DROP OFF HUB UPSERT HUB SUMMARY data =========', data);
                console.log('### SCAN DROP OFF HUB UPSERT HUB SUMMARY itemAwb =========', itemAwb);
                console.log(upsertRawHubSummaryAwbSql);
                UpsertHubSummaryAwbQueueService.perform(
                  data.branchId,
                  itemAwb.awbNumber,
                  data.bagItemId,
                  data.bagId,
                  itemAwb.awbItemId,
                  data.userId,
                );
                console.log('### SCAN DROP OFF HUB END =========', itemAwb.awbNumber);
              }
            }
          } // end of loop
        } else {
          console.log('### Data Bag Item Awb :: Not Found!!');
        }
        return true;
      } catch (error) {
        console.error(`[bag-dropoff-hub-queue] `, error);
        throw error;
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
    dropoffHubId: string,
    bagItemId: number,
    userId: number,
    branchId: number,
    isSmd = 0,
    bagId = 0,
    isSortir = false,
  ) {
    const obj = {
      dropoffHubId,
      bagItemId,
      userId,
      branchId,
      timestamp: moment().toDate(),
      isSmd,
      bagId,
      isSortir,
    };

    return BagDropoffHubQueueService.queue.add(obj);
  }
}
