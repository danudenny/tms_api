import moment = require('moment');
import { ConfigService } from '../../../shared/services/config.service';
import { QueueBullBoard } from './queue-bull-board';
import { AWB_STATUS } from '../../../shared/constants/awb-status.constant';
import { AwbHistory } from '../../../shared/orm-entity/awb-history';
import { PinoLoggerService } from '../../../shared/services/pino-logger.service';

// DOC: https://optimalbits.github.io/bull/

export class BagRepresentativeSmdQueueService {
  public static queue = QueueBullBoard.createQueue.add(
    'bag-representative-smd-queue',
    {
      defaultJobOptions: {
        timeout: 0,
        attempts: Math.round(
          (+ConfigService.get('queue.doSmdDetailPostMeta.keepRetryInHours') *
            60 *
            60 *
            1000) /
            +ConfigService.get('queue.doSmdDetailPostMeta.retryDelayMs'),
        ),
        backoff: {
          type: 'fixed',
          delay: ConfigService.get('queue.doSmdDetailPostMeta.retryDelayMs'),
        },
      },
      redis: ConfigService.get('redis'),
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
        // await getManager().transaction(async transactionalEntityManager => {
        // }); // end transaction
        PinoLoggerService.log(`### BAG REPRESENTATIVE SMD JOB ID ========= ${job.id}`);
        const data = job.data;
        
        const awbHistory = AwbHistory.create();
        awbHistory.awbItemId = data.awbItemId;
        awbHistory.branchId = data.branchId.toString();
        awbHistory.refAwbNumber = data.refAwbNumber;
        awbHistory.historyDate = moment().toDate();
        awbHistory.awbStatusId = AWB_STATUS.IN_SORTIR;
        awbHistory.userId= data.userId;
        awbHistory.noteInternal= data.noteInternal;
        awbHistory.userIdCreated = Number(data.userId);
        awbHistory.createdTime = moment().toDate();
        awbHistory.userIdUpdated = Number(data.userId);
        awbHistory.updatedTime = moment().toDate();
        await AwbHistory.insert(awbHistory);

        return true;
      } catch (error) {
        console.error(`[bag-representative-smd-queue] `, error);
        throw error;
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
    // doSmdDetailIds: any,
    awbItemId: any,
    refAwbNumber: any,
    userId: number,
    branchId: number,
    branchName: string,
    cityName: string,
  ) {
    const noteInternal = `Paket telah di terima di ${cityName} [${branchName}]`;
    const obj = {
      awbItemId,
      refAwbNumber,
      userId,
      branchId,
      noteInternal,
      timestamp: moment().toDate(),
    };

    return BagRepresentativeSmdQueueService.queue.add(obj);
  }
}
