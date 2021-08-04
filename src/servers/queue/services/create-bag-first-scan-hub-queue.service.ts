import { EntityManager, getManager, In } from 'typeorm';
import { AwbItemAttr } from '../../../shared/orm-entity/awb-item-attr';
import { BagItemAwb } from '../../../shared/orm-entity/bag-item-awb';
import { PodScanInHubBag } from '../../../shared/orm-entity/pod-scan-in-hub-bag';
import { PodScanInHubDetail } from '../../../shared/orm-entity/pod-scan-in-hub-detail';
import { ConfigService } from '../../../shared/services/config.service';
import { DoPodDetailPostMetaQueueService } from './do-pod-detail-post-meta-queue.service';
import { QueueBullBoard } from './queue-bull-board';
import { HubSummaryAwb } from '../../../shared/orm-entity/hub-summary-awb';
import moment = require('moment');
import * as _ from 'lodash';
import { UpsertHubSummaryBagSortirQueueService } from './upsert-hub-summary-bag-sortir-queue.service';

// DOC: https://optimalbits.github.io/bull/

export class CreateBagFirstScanHubQueueService {
  public static queue = QueueBullBoard.createQueue.add(
    'create-bag-first-scan-hub-queue',
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
    this.queue.process(async job => {
      const data = job.data;
      const dateNow = moment().format('YYYY-MM-DD HH:mm:ss');

      const awbItemAttr = await AwbItemAttr.findOne({
        where: { awbItemId: data.awbItemId, isDeleted: false },
      });

      await getManager().transaction(async transactional => {
        // Handle first awb scan
        // const awbItemAttr = await AwbItemAttr.findOne({
        //   where: { awbItemId: data.awbItemId, isDeleted: false },
        // });
        // Pindah Ke atas Transaction

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
            awbId: awbItemAttr.awbId,
            awbNumber: data.awbNumber,
            userIdCreated: data.userId,
            userIdUpdated: data.userId,
            createdTime: data.timestamp,
            updatedTime: data.timestamp,
          });
          await transactional.insert(PodScanInHubDetail, podScanInHubDetailData);

          // insert into pod scan in hub bag
          const podScanInHubBagData = PodScanInHubBag.create({
            podScanInHubId: data.podScanInHubId,
            branchId: data.branchId,
            bagId: data.bagId,
            bagNumber: data.bagNumber,
            bagItemId: data.bagItemId,
            totalAwbItem: 1,
            totalAwbScan: 1,
            userIdCreated: data.userId,
            userIdUpdated: data.userId,
            createdTime: data.timestamp,
            updatedTime: data.timestamp,
          });
          await transactional.insert(PodScanInHubBag, podScanInHubBagData);

          // Handling case scanin hub-to-hub using input bag sortir
          // , when create bag sortir before scanin hub (status in_hub before do_hub)
          // UPSERT STATUS IN HUB IN AWB SUMMARY
          // TODO: need refactoring
          // const summary = await HubSummaryAwb.find({
          //   where: {
          //     awbNumber: data.awbNumber,
          //   },
          // });
          // if (summary && summary.length) {
          //   await HubSummaryAwb.update(
          //     { awbNumber: data.awbNumber },
          //     {
          //       scanDateInHub: dateNow,
          //       inHub: true,
          //       bagItemIdIn: data.bagItemId,
          //       bagIdIn: data.bagId,
          //       userIdUpdated: data.userId,
          //       updatedTime: data.timestamp,
          //     },
          //   );
          // } else {
          //   const hubSummaryAwb = HubSummaryAwb.create(
          //     {
          //       scanDateInHub: dateNow,
          //       branchId: data.branchId,
          //       awbNumber: data.awbNumber,
          //       inHub: true,
          //       bagItemIdIn: data.bagItemId,
          //       bagIdIn: data.bagId,
          //       awbItemId: data.awbItemId,
          //       userIdCreated: data.userId,
          //       userIdUpdated: data.userId,
          //       createdTime: data.timestamp,
          //       updatedTime: data.timestamp,
          //     },
          //   );
          //   await HubSummaryAwb.insert(hubSummaryAwb);
          // }

          // const upsertRawHubSummaryAwbSql = `insert into hub_summary_awb (awb_number, scan_date_in_hub,in_hub, bag_item_id_in, bag_id_in, awb_item_id, user_id_updated, updated_time, branch_id,user_id_created, created_time)
          //                   values ('${escape(data.awbNumber)}', '${dateNow}', true, ${data.bagItemId}, ${data.bagId}, ${data.awbItemId}, ${data.userId}, '${dateNow}', ${data.branchId}, ${data.userId}, '${dateNow}')
          //                   ON CONFLICT (awb_number,branch_id) DO UPDATE SET in_hub = true, scan_date_in_hub = '${dateNow}', bag_item_id_in = ${data.bagItemId}, bag_id_in = ${data.bagId}, user_id_updated=${data.userId}, updated_time='${dateNow}', branch_id=${data.branchId};`;
          //
          // await transactional.query(upsertRawHubSummaryAwbSql);

          console.log('### CREATE BAG FIRST SCAN HUB ========= UPSERT HUB SUMMARY BAG SORTIR');
          UpsertHubSummaryBagSortirQueueService.perform(
            data.bagId,
            data.bagItemId,
            data.bagNumber,
            data.awbItemId,
            data.awbNumber,
            data.userId,
            data.branchId,
            moment(data.timestamp).toDate(),
          );

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

    this.queue.on('cleaned', function (job, type) {
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

    return CreateBagFirstScanHubQueueService.queue.add(obj);
  }

}
