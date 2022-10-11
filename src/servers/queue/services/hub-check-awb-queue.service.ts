import { getManager } from 'typeorm';
import { AwbCheckLog } from '../../../shared/orm-entity/awb-check-log';
import { AwbCheckSummary } from '../../../shared/orm-entity/awb-check-summary';
import { ConfigService } from '../../../shared/services/config.service';
import { PinoLoggerService } from '../../../shared/services/pino-logger.service';
import { CheckAwbQueuePayload } from '../../hub/models/check-awb/check-awb.payload';
import { QueueBullBoard } from './queue-bull-board';

// Insert awb_check_log and increment awb_check_sumamry logs count
export class HubCheckAwbQueueService {
  public static queue = QueueBullBoard.createQueue.add('hub-check-awb-queue', {
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
      duration: 5000, // in seconds
    },
  });

  public static boot() {
    this.queue.process(5, async job => {
      try {
        const { userId, time, awbNumber, awbCheckId } = job.data;
        const summary = AwbCheckSummary.findOne({
          id: awbCheckId,
          isDeleted: false,
        });
        if (!summary) {
          return;
        }
        await getManager().transaction(async manager => {
          await manager.insert(AwbCheckLog, {
            awbCheckSummaryId: awbCheckId,
            awbNumber,
            createdTime: time,
            updatedTime: time,
            userIdCreated: userId,
            userIdUpdated: userId,
          });
          await manager.increment(
            AwbCheckSummary,
            { id: awbCheckId, isDeleted: false },
            'logs',
            1,
          );
          await manager.update(
            AwbCheckSummary,
            { id: awbCheckId, isDeleted: false },
            { endTime: time },
          );
        });
        return;
      } catch (error) {
        console.error(`[hub-check-awb-queue] `, error);
        throw error;
      }
    });

    this.queue.on('completed', job => {
      this.queue.clean(5000);
      PinoLoggerService.log(`Job with id ${job.id} has been completed`);
    });

    this.queue.on('cleaned', function(job, type) {
      PinoLoggerService.log(`Cleaned ${job.length} ${type} jobs`);
    });
  }

  public static async addJob(data: CheckAwbQueuePayload) {
    return HubCheckAwbQueueService.queue.add(data);
  }
}
