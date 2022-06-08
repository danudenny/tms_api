import moment = require('moment');
import { getManager } from 'typeorm';
import { PinoLoggerService } from '../../../shared/services/pino-logger.service';

import { HubSummaryAwb } from '../../../shared/orm-entity/hub-summary-awb';
import { ConfigService } from '../../../shared/services/config.service';
import { RedisService } from '../../../shared/services/redis.service';
import { QueueBullBoard } from './queue-bull-board';

export class UpsertHubSummaryAwbQueueService {
  public static queue = QueueBullBoard.createQueue.add(
    'upsert-hub-summary-queue',
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
    this.queue.process(10, async job => {
      PinoLoggerService.log(`### UPSERT HUB SUMMARY AWB ========= ${job.id}`);
      const data = job.data;
      const dateNow = moment().format('YYYY-MM-DD HH:mm:ss');
      PinoLoggerService.log(
        `### UPSERT HUB SUMMARY AWB NUMBER ========= ${data.awbNumber}`,
      );
      try {
        const redlock = await RedisService.redlock(
          `redlock:hsa:do:${data.awbNumber}:${data.branchId}`,
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
                scanDateDoHub: dateNow,
                doHub: true,
                userIdUpdated: data.userId,
                updatedTime: dateNow,
              },
            );
            return;
          }
          await transactional.insert(HubSummaryAwb, {
            scanDateDoHub: dateNow,
            branchId: data.branchId,
            awbNumber: data.awbNumber,
            doHub: true,
            bagItemIdIn: data.bagItemId,
            bagIdIn: data.bagId,
            awbItemId: data.awbItemId,
            userIdCreated: data.userId,
            userIdUpdated: data.userId,
            createdTime: dateNow,
            updatedTime: dateNow,
          });
        });
      } catch (error) {
        console.error('### ERROR UPSERT', error);
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
    bagItemId: number,
    bagId: number,
    awbItemId: number,
    userId: number,
  ) {
    const obj = {
      branchId,
      awbNumber,
      bagItemId,
      bagId,
      awbItemId,
      userId,
    };

    return UpsertHubSummaryAwbQueueService.queue.add(obj);
  }
}
