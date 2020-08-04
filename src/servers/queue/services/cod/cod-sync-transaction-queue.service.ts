import { CodTransactionDetail } from '../../../../shared/orm-entity/cod-transaction-detail';
import { ConfigService } from '../../../../shared/services/config.service';
import { MongoDbConfig } from '../../config/database/mongodb.config';
import { QueueBullBoard } from '../queue-bull-board';

// Sync Update Data Transaction to Mongodb
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
    this.queue.process(async job => {

      const data = job.data;
      // get config mongodb
      const collection = await MongoDbConfig.getDbSicepatCod('transaction_detail');

      try {
        const checkData = await collection.findOne({
          _id: data.awbNumber,
        });
        console.log('##### SYNC MONGO AWB :: ', data.awbNumber);

        if (checkData) {
          console.log('## UPDATE DATA IN MONGO !!!');
          const transactionStatusId = data.transactionStatusId ? Number(data.transactionStatusId) : null;
          const supplierInvoiceStatusId = data.supplierInvoiceStatusId ? Number(data.supplierInvoiceStatusId) : null;
          const objUpdate = {
            codTransactionId: data.codTransactionId,
            transactionStatusId,
            codSupplierInvoiceId: data.codSupplierInvoiceId,
            supplierInvoiceStatusId,
            updatedTime: data.timestamp,
            userIdUpdated: data.userId,
          };
          await collection.updateOne(
            { _id: data.awbNumber },
            {
              $set: objUpdate,
            },
          );
        } else {
          console.log('## NOT FOUND DATA IN MONGO !!! ', data.awbNumber);
        }
      } catch (error) {
        console.error(error);
        throw error;
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
    codTransactionId: string,
    transactionStatusId: number,
    codSupplierInvoiceId: string,
    supplierInvoiceStatusId: number,
    userId: number,
    timestamp: Date,
  ) {
    const obj = {
      awbNumber,
      codTransactionId,
      transactionStatusId,
      codSupplierInvoiceId,
      supplierInvoiceStatusId,
      userId,
      timestamp,
    };

    return CodSyncTransactionQueueService.queue.add(obj);
  }

}
