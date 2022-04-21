import moment = require('moment');
import { ConfigService } from '../../../shared/services/config.service';
import { BagItemHistory } from '../../../shared/orm-entity/bag-item-history';
import { QueueBullBoard } from './queue-bull-board';
import { BagItem } from '../../../shared/orm-entity/bag-item';
import { PinoLoggerService } from '../../../shared/services/pino-logger.service';

// DOC: https://optimalbits.github.io/bull/

export class BagItemHistoryQueueService {
  public static queue = QueueBullBoard.createQueue.add('bag-item-history-queue', {
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
  });

  public static boot() {
    // NOTE: Concurrency defaults to 1 if not specified.
    this.queue.process(5, async job => {
      try {
        // await getManager().transaction(async transactionalEntityManager => {
        // }); // end transaction
        const data = job.data;

        if (data.bagItemId) {
          const bagItemHistory = BagItemHistory.create();
          bagItemHistory.branchId = data.branchId;
          bagItemHistory.userId = data.userId;
          bagItemHistory.bagItemId = data.bagItemId;
          bagItemHistory.bagItemStatusId = data.bagItemStatusId;
          bagItemHistory.historyDate = data.timestamp;
          bagItemHistory.userIdCreated = data.userId;
          bagItemHistory.userIdUpdated = data.userId;
          await BagItemHistory.insert(bagItemHistory);

          // await BagItem.update({ bagItemId: data.bagItemId }, {
          //   bagItemStatusIdLast: data.bagItemStatusId,
          //   bagItemHistoryId: Number(bagItemHistory.bagItemHistoryId),
          //   branchIdLast: data.branchId,
          // });
          return true;
        }
      } catch (error) {
        console.error(`[bag-item-history-queue] `, error);
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

  public static async addData(
    bagItemId: number,
    bagItemStatusId: number,
    branchId: number,
    userId: number,
    addTime?: number,
    ) {

    // NOTE: obj data
    // force bag history created time greater than now
    // ,to avoid wrong sorting in tracking
    const obj = {
      bagItemId,
      bagItemStatusId,
      branchId,
      userId,
      timestamp: addTime ? moment().add(addTime, 'minutes').toDate() : moment().toDate(),
    };

    return BagItemHistoryQueueService.queue.add(obj);
  }

}
