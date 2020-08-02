import { CodTransactionDetail } from '../../../../shared/orm-entity/cod-transaction-detail';
import { ConfigService } from '../../../../shared/services/config.service';
import { MongoDbConfig } from '../../config/database/mongodb.config';
import { QueueBullBoard } from '../queue-bull-board';

export class CodSyncTransactionQueueService {
  public static queue = QueueBullBoard.createQueue.add(
    'cod-sync-transaction-queue',
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

      const data = job.data;
      // get config mongodb
      const collection = await MongoDbConfig.getDbSicepatCod('transaction_detail');
      const itemTransaction = await CodTransactionDetail.findOne({
        where: {
          awbNumber: data.awbNumber,
          isDeleted: false,
        },
      });
      if (itemTransaction) {
        delete itemTransaction['changedValues'];
        itemTransaction.userIdCreated = Number(itemTransaction.userIdCreated);
        itemTransaction.userIdUpdated = Number(itemTransaction.userIdUpdated);

        try {
          const checkData = await collection.findOne({
            _id: itemTransaction.awbNumber,
          });
          console.log('##### SYNC MONGO AWB :: ', data.awbNumber);

          if (checkData) {
            console.log('## UPDATE DATA IN MONGO !!!');
            const objUpdate = {
              codTransactionId: itemTransaction.codTransactionId,
              transactionStatusId: itemTransaction.transactionStatusId,
              updatedTime: data.timestamp,
              userIdUpdated: itemTransaction.userIdUpdated,
            };
            await collection.updateOne(
              { _id: itemTransaction.awbNumber },
              {
                $set: objUpdate,
              },
            );
          } else {
            console.log('## NEW DATA IN MONGO !!!');
            await collection.insertOne({ _id: itemTransaction.awbNumber, ...itemTransaction });
          }
        } catch (error) {
          console.error(error);
          throw error;
        }
      } else {
        console.log('##### DATA SYNC AWB NOT FOUND !! ', data.awbNumber);
      }
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

  public static async perform(
    awbNumber: string,
    timestamp: Date,
  ) {
    const obj = {
      awbNumber,
      timestamp,
    };

    return CodSyncTransactionQueueService.queue.add(obj);
  }

}
