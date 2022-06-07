import moment = require('moment');
import { getManager } from 'typeorm';
import { PinoLoggerService } from '../../../shared/services/pino-logger.service';

import { HubSummaryAwb } from '../../../shared/orm-entity/hub-summary-awb';
import { ConfigService } from '../../../shared/services/config.service';
import { RedisService } from '../../../shared/services/redis.service';
import { QueueBullBoard } from './queue-bull-board';

export class UpdateHubSummaryAwbOutQueueService {
  public static queue = QueueBullBoard.createQueue.add(
    'upsert-hub-summary-awb-out-queue',
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
    this.queue.process(5, async job => {
      PinoLoggerService.log(
        `### UPDATE HUB SUMMARY AWB OUT ========= ${job.id}`,
      );
      const data = job.data;
      const dateNow = moment().format('YYYY-MM-DD HH:mm:ss');
      PinoLoggerService.log(
        `### UPDATE HUB SUMMARY AWB NUMBER OUT ========= ${data.awbNumber}`,
      );

      try {
        const redlock = await RedisService.redlock(
          `redlock:hsa:out:${data.awbNumber}:${data.branchId}`,
        );
        if (!redlock) {
          throw Error(`Awb ${data.awbNumber} is being processed`);
        }
        const hsa = await HubSummaryAwb.findOne(
          {
            awbNumber: data.awbNumber,
            branchId: data.branchId,
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
              },
              {
                scanDateOutHub: dateNow,
                outHub: true,
                userIdUpdated: data.userId,
                updatedTime: dateNow,
              },
            );
            return;
          }
          await transactional.insert(HubSummaryAwb, {
            scanDateOutHub: dateNow,
            branchId: data.branchId,
            awbNumber: data.awbNumber,
            outHub: true,
            bagItemIdIn: data.bagItemId,
            bagIdIn: data.bagId,
            awbItemId: data.awbItemId,
            userIdCreated: data.userId,
            userIdUpdated: data.userId,
            createdTime: dateNow,
            updatedTime: dateNow,
          });

          // const upsertRawHubSummaryAwbOutSql = `insert into hub_summary_awb (awb_number,user_id_updated, updated_time, branch_id,user_id_created, created_time, out_hub)
          //                     values ('${escape(data.awbNumber)}', ${data.userId}, '${dateNow}', ${data.branchId}, ${data.userId}, '${dateNow}', true)
          //                     ON CONFLICT (awb_number,branch_id) DO UPDATE SET out_hub = true, scan_date_out_hub = '${dateNow}', user_id_updated=${data.userId}, updated_time='${dateNow}';`;

          // PinoLoggerService.log(`### UPSERT HUB SUMMARY AWB OUT QUERY ========= ${upsertRawHubSummaryAwbOutSql}`);
          // await transactional.query(upsertRawHubSummaryAwbOutSql);
        });
      } catch (error) {
        console.error(
          '[upsert-hub-summary-awb-out-queue] ### ERROR UPSERT',
          error,
        );
        // console.log('### ERROR UPSERT',error );
      }
    });

    this.queue.on('completed', job => {
      // cleans all jobs that completed over 5 seconds ago.
      this.queue.clean(5000);
      PinoLoggerService.log(`Job with id ${job.id} has been completed`);
    });

    this.queue.on('cleaned', function(job, type) {
      PinoLoggerService.log(`Cleaned ${job.length} ${type} jobs`);
    });
  }

  public static async perform(
    branchId: number,
    awbNumber: string,
    userId: number,
  ) {
    const obj = {
      branchId,
      awbNumber,
      userId,
    };

    return UpdateHubSummaryAwbOutQueueService.queue.add(obj);
  }
}
