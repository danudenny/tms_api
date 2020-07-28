import { QueueBullBoard } from '../queue-bull-board';
import { ConfigService } from '../../../../shared/services/config.service';
import { CodTransactionHistory } from '../../../../shared/orm-entity/cod-transaction-history';
import { MongoDbConfig } from '../../config/database/mongodb.config';
import { TRANSACTION_STATUS } from '../../../../shared/constants/transaction-status.constant';

// DOC: https://optimalbits.github.io/bull/

export class CodTransactionHistoryQueueService {
  public static queue = QueueBullBoard.createQueue.add(
    'cod-transaction-history-queue',
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
      // check visibility status by transactionStatusId
      const visibility = Number(data.transactionStatusId) <= 40000 ? 10 : 20;
      const historyInvoice = CodTransactionHistory.create({
        awbItemId: data.awbItemId,
        awbNumber: data.awbNumber,
        transactionDate: data.timestamp,
        transactionStatusId: data.transactionStatusId,
        branchId: data.branchId,
        visibility,
        userIdCreated: data.userId,
        userIdUpdated: data.userId,
        createdTime: data.timestamp,
        updatedTime: data.timestamp,
      });
      await CodTransactionHistory.insert(historyInvoice);

      // get config mongodb
      const transactionStatusId = Number(data.transactionStatusId);
      if (data.isPartial == true ) {
        const collection = await MongoDbConfig.getDbSicepatCod(
          'transaction_detail',
        );
        let objUpdate = {};
        // supplier invoice status
        // cancel draft
        if (transactionStatusId == TRANSACTION_STATUS.CANCEL_DRAFT) {
          objUpdate = {
            codSupplierInvoiceId: null,
            supplierInvoiceStatusId: null,
            userIdUpdated: data.userId,
            updatedTime: data.timestamp,
          };
          // awb void
        } else if (transactionStatusId == TRANSACTION_STATUS.VOID) {
          objUpdate = {
            codSupplierInvoiceId: null,
            supplierInvoiceStatusId: null,
            isVoid: true,
            userIdUpdated: data.userId,
            updatedTime: data.timestamp,
          };
        } else {
          objUpdate = {
            transactionStatusId,
            userIdUpdated: data.userId,
            updatedTime: data.timestamp,
          };
        }

        try {
          const res = await collection.findOneAndUpdate(
            { _id: data.awbNumber },
            {
              $set: objUpdate,
            },
          );
        } catch (error) {
          console.error(error);
        }
      } // end partial update

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
    awbItemId: number,
    awbNumber: string,
    transactionStatusId: number,
    branchId: number,
    userId: number,
    timestamp: Date,
    isPartial: boolean = false,
  ) {
    const obj = {
      awbItemId,
      awbNumber,
      transactionStatusId,
      branchId,
      userId,
      timestamp,
      isPartial,
    };

    return CodTransactionHistoryQueueService.queue.add(obj);
  }
}
