import moment = require('moment');
import { ConfigService } from '../../../shared/services/config.service';
import { BagItemAwb } from '../../../shared/orm-entity/bag-item-awb';
import { QueueBullBoard } from './queue-bull-board';

// DOC: https://optimalbits.github.io/bull/

export class BagItemAwbQueueService {
  public static queue = QueueBullBoard.createQueue.add('bag-item-awb-queue', {
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
      // await getManager().transaction(async transactionalEntityManager => {
      // }); // end transaction
      console.log('### JOB ID =========', job.id);
      console.log('### DATA =========', job.data);
      const data = job.data;

      // await transactionEntityManager.insert(
      //   DoPodDeliverHistory,
      //   doPodDeliverHistories,
      // );

      const bagItemAwb = BagItemAwb.create();
      bagItemAwb.bagItemId = data.bagItemId;
      bagItemAwb.awbNumber = data.awbNumber;
      bagItemAwb.weight = data.weight;
      bagItemAwb.createdTime = data.timestamp;
      bagItemAwb.updatedTime = data.timestamp;
      bagItemAwb.userIdCreated = data.userId;
      bagItemAwb.userIdUpdated = data.userId;
      await BagItemAwb.insert(bagItemAwb);
      return true;
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

  public static async addData(arrAwb:any = []) {

    const arrBag: BagItemAwb[] = [];
    for (const data of arrAwb) {
      const bagItemAwb = BagItemAwb.create(
        {
          bagItemId: data.bagItemId,
          awbNumber: data.awbNumber,
          weight: data.weight,
          createdTime: data.timestamp,
          updatedTime: data.timestamp,
          userIdCreated: data.userId,
          userIdUpdated: data.userId
        }
      );
      arrBag.push(bagItemAwb);
    }
    BagItemAwbQueueService.queue.add(arrBag);

    return true;
  }

}
