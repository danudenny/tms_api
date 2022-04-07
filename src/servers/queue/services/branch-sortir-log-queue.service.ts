import { ConfigService } from '../../../shared/services/config.service';
import { QueueBullBoard } from './queue-bull-board';
import { BranchSortirLogDetail } from '../../../shared/orm-entity/branch-sortir-log-detail';
import moment= require('moment');

// DOC: https://optimalbits.github.io/bull/

export class BranchSortirLogQueueService {
  public static queue = QueueBullBoard.createQueue.add(
    'branch-sortir-log-queue',
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
      console.log('### CREATE BRANCH SORTIR LOG QUEUE ID =========', job.id);
      try {
        const data = job.data;

        const branchSortirLogDetail = BranchSortirLogDetail.create({
          scanDate: moment(data.scanDate).format('YYYY-MM-DD 00:00:00'),
          branchId: data.branchId,
          awbNumber: data.awbNumber,
          noChute: data.noChute,
          branchIdLastmile: data.branchIdLastmile,
          isCod: data.isCod,
          isSucceed: data.state == 0 ? true : false,
          reason: data.message,
          userIdCreated: data.userId,
          userIdUpdated: data.userId,
          updatedTime: moment().toDate(),
          createdTime: moment().toDate(),
        });
        return BranchSortirLogDetail.save(branchSortirLogDetail);
      } catch (error) {
        console.error(`[branch-sortir-log-queue] `, error);
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
    message: string,
    scanDate: Date,
    state: 0|1,
    branchId: string | number,
    awbNumber: string | number,
    noChute: number | string,
    branchIdLastmile: number | string,
    isCod: boolean,
    userId: number = 1,
  ) {
    const obj = {
      message,
      scanDate,
      state,
      branchId,
      awbNumber,
      noChute,
      branchIdLastmile,
      isCod,
      userId,
    };

    return BranchSortirLogQueueService.queue.add(obj);
  }
}
