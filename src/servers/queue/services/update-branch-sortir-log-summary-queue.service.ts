import { QueueBullBoard } from './queue-bull-board';
import { ConfigService } from '../../../shared/services/config.service';
import moment = require('moment');
import { BranchSortirLogSummary } from '../../../shared/orm-entity/branch-sortir-log-summary';
import { getManager } from 'typeorm';
import { PinoLoggerService } from '../../../shared/services/pino-logger.service';

export class UpdateBranchSortirLogSummaryQueueService {
  public static queue = QueueBullBoard.createQueue.add(
    'update-branch-sortir-log-summary-queue',
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
      const data = job.data;
      try {
        PinoLoggerService.log('Update Seal Number Branch Sortir Log Process');
        await getManager().transaction(async transactionManager => {
          await transactionManager.update(BranchSortirLogSummary, {
            awbNumber: data.awbNumber,
            branchId: data.branchId,
          }, { sealNumber: data.sealNumber, updatedTime: data.timestamp});
        });
        PinoLoggerService.log('End Update Seal Number Branch Sortir Log Process');
      } catch (error) {
        console.error('[update-branch-sortir-log-summary-queue] ### ERROR UPDATE SEAL NUMBER BRANCH SORTIR LOG', error);
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
    branchId: number,
    awbNumber: string,
    sealNumber: string,
    addTime?: number,
  ) {
    const obj = {
      branchId,
      awbNumber,
      sealNumber,
      timestamp: addTime ? moment().add(addTime, 'minutes').toDate() : moment().toDate(),
    };

    return UpdateBranchSortirLogSummaryQueueService.queue.add(obj);
  }
}
