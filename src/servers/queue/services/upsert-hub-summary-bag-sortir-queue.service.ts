import moment = require('moment');
import { getManager } from 'typeorm';

import { HubSummaryAwb } from '../../../shared/orm-entity/hub-summary-awb';
import { ConfigService } from '../../../shared/services/config.service';
import { PinoLoggerService } from '../../../shared/services/pino-logger.service';
import { RedisService } from '../../../shared/services/redis.service';
import { QueueBullBoard } from './queue-bull-board';

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
    },
  );

  public static boot() {
    // NOTE: Concurrency defaults to 1 if not specified.
    this.queue.process(5, async job => {
      const data = job.data;
      // const podScanInHubBag = await PodScanInHubBag.findOne({
      //   where: { bagItemId: data.bagItemId },
      // });
      try {
        const dateNow = moment().format('YYYY-MM-DD HH:mm:ss');
        // const note = data.note ? `'${data.note}'` : null;
        const redlock = await RedisService.redlock(
          `redlock:hsa:in:${data.awbNumber}:${data.branchId}`,
        );
        if (!redlock) {
          throw Error(`Awb ${data.awbNumber} is being processed`);
        }
        const hsa = await HubSummaryAwb.findOne(
          {
            awbNumber: data.awbNumber,
            branchId: data.branchId,
            isDeleted: false,
          },
          { select: ['hubSummaryAwbId'] },
        );

        await getManager().transaction(async transactional => {
          if (hsa) {
            await transactional.update(
              HubSummaryAwb,
              {
                awbNumber: data.awbNumber,
                branchId: data.branchId,
                isDeleted: false,
              },
              {
                inHub: true,
                scanDateInHub: dateNow,
                bagItemIdIn: data.bagItemId,
                bagIdIn: data.bagId,
                note: data.note,
                inIsManual: data.isManual,
                inIsSortir: data.isSortir,
                userIdUpdated: data.userId,
                updatedTime: dateNow,
              },
            );
            return;
          }
          await transactional.insert(HubSummaryAwb, {
            scanDateInHub: dateNow,
            branchId: data.branchId,
            awbNumber: data.awbNumber,
            inHub: true,
            bagItemIdIn: data.bagItemId,
            bagIdIn: data.bagId,
            awbItemId: data.awbItemId,
            note: data.note,
            inIsManual: data.isManual,
            inIsSortir: data.isSortir,
            userIdCreated: data.userId,
            userIdUpdated: data.userId,
            createdTime: dateNow,
            updatedTime: dateNow,
          });

          // const upsertRawHubSummaryAwbSql = `insert into hub_summary_awb (awb_number, scan_date_in_hub, in_hub, bag_item_id_in, bag_id_in, awb_item_id, note, user_id_updated, updated_time, branch_id, user_id_created, created_time)
          //                   values ('${escape(data.awbNumber)}', '${dateNow}', true, ${data.bagItemId}, ${data.bagId}, ${data.awbItemId}, ${note}, ${data.userId}, '${dateNow}', ${data.branchId}, ${data.userId}, '${dateNow}')
          //                   ON CONFLICT (awb_number,branch_id) DO
          //                   UPDATE SET in_hub = true, scan_date_in_hub = '${dateNow}', bag_item_id_in = ${data.bagItemId}, bag_id_in = ${data.bagId}, note=${note}, user_id_updated=${data.userId}, updated_time='${dateNow}';`;
          // PinoLoggerService.log(`### UPSERT IN HUB SUMMARY QUERY ========= ${upsertRawHubSummaryAwbSql}`);
          // await transactional.query(upsertRawHubSummaryAwbSql);
        });
      } catch (error) {
        console.error(
          '[upsert-hub-summary-bag-sortir-queue] ### ERROR UPSERT',
          error,
        );
      }
      return true;
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
    bagId: number,
    bagItemId: number,
    bagNumber: string,
    awbItemId: number,
    awbNumber: string,
    userId: number,
    branchId: number,
    timestamp: Date,
    note: string | null = null,
    isManual: boolean = true,
    isSortir: boolean = true,
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
      note,
      isManual,
      isSortir,
    };

    return UpsertHubSummaryBagSortirQueueService.queue.add(obj);
  }
}
