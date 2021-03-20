import { ConfigService } from '../../../shared/services/config.service';
import { QueueBullBoard } from './queue-bull-board';
import { BranchSortirLogDetail } from '../../../shared/orm-entity/branch-sortir-log-detail';
import { BranchSortirLog } from '../../../shared/orm-entity/branch-sortir-log';
import { Between, getManager } from 'typeorm';
import moment= require('moment');

// DOC: https://optimalbits.github.io/bull/

export class BagSortirLogQueueService {
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
      const data = job.data;
      const isSucceed = data.state == 1 ? true : false;

      const branchSortirLog = await BranchSortirLog.findOne({
        where: {
          scanDate: Between(
            data.scanDate.format('YYYY-MM-DD') + ' 00:00:00',
            data.scanDate.add(1, 'days').format('YYYY-MM-DD') + ' 00:00:00',
          ),
          isDeleted: false,
        },
      });

      if (branchSortirLog) {
        await getManager().transaction(async transactionEntityManager => {
          if (isSucceed) {
            await transactionEntityManager.increment(
              BranchSortirLog,
              {
                branchSortirLogId: branchSortirLog.branchSortirLogId,
              },
              'qtySucceed',
              1,
            );
          } else {
            await transactionEntityManager.increment(
              BranchSortirLog,
              {
                branchSortirLogId: branchSortirLog.branchSortirLogId,
              },
              'qtyFail',
              1,
            );
          }
        });
      } else {
        const cSuccess = 1;
        let cFail = 1;
        if (isSucceed) { cFail = 0; }

        const createBranchSortirLog = BranchSortirLog.create({
          scanDate: data.scanDate,
          qtySucceed: cSuccess,
          qtyFail: cFail,
          createdTime: moment().toDate(),
          updatedTime: moment().toDate(),
          userIdCreated: data.userId,
          userIdUpdated: data.userId,
        });
        BranchSortirLog.save(createBranchSortirLog);
      }

      const branchSortirLogDetail = BranchSortirLogDetail.create({
        branchSortirLogId: branchSortirLog.branchSortirLogId,
        scanDate: data.scanDate,
        branchId: data.branchId,
        awbNumber: data.awbNumber,
        noChute: data.noChute,
        branchIdLastmile: data.branchIdLastmile,
        isCod: data.isCod,
        isSucceed,
        reason: data.message,
      });
      return BranchSortirLogDetail.save(branchSortirLogDetail);
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
    };

    return BagSortirLogQueueService.queue.add(obj);
  }
}
