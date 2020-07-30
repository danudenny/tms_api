import { CodTransactionDetail } from '../../../../shared/orm-entity/cod-transaction-detail';
import { ConfigService } from '../../../../shared/services/config.service';
import { MongoDbConfig } from '../../config/database/mongodb.config';
import { QueueBullBoard } from '../queue-bull-board';
import { CodTransactionHistoryQueueService } from './cod-transaction-history-queue.service';

export class CodUpdateSupplierInvoiceQueueService {
  public static queue = QueueBullBoard.createQueue.add(
    'cod-update-supplier-invoice-queue',
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

      // Update data mongo
      // #region mongodb
      const collection = await MongoDbConfig.getDbSicepatCod(
        'transaction_detail',
      );
      const supplierInvoiceStatusId = Number(data.supplierInvoiceStatusId);
      const partnerId = Number(data.partnerId);
      let query = {};
      let dataUpdate = {};

      if (supplierInvoiceStatusId == 41000) {
        query = {
          partnerId,
          codSupplierInvoiceId: null,
          transactionStatusId: 40000,
          isVoid: false,
        };
        dataUpdate = {
          $set: {
            codSupplierInvoiceId: data.codSupplierInvoiceId,
            supplierInvoiceStatusId,
          },
        };
        console.log(' ####### UPDATE SUPPLIER INVOICE :: ', data.codSupplierInvoiceId);
      } else {
        // 45000 [PAID]
        // query store the search condition
        query = { codSupplierInvoiceId: data.codSupplierInvoiceId };
        // data stores the updated value
        dataUpdate = {
          $set: { supplierInvoiceStatusId },
        };
      }

      try {
        console.log('## Update MongoDb :: ', dataUpdate);
        const updateMongo = await collection.updateMany(query, dataUpdate);
      } catch (error) {
        console.error(error);
        throw error;
      }
      // #endregion

      const dataTransaction = await CodTransactionDetail.find({
        select: ['awbNumber', 'awbItemId'],
        where: {
          codSupplierInvoiceId: data.codSupplierInvoiceId,
          isDeleted: false,
        },
      });

      console.log('##### TOTAL DATA Transaction :: ', dataTransaction.length);
      if (dataTransaction.length) {
        for (const item of dataTransaction) {
          // update data history supplier invoice
          CodTransactionHistoryQueueService.perform(
            item.awbItemId,
            item.awbNumber,
            data.supplierInvoiceStatusId,
            data.branchId,
            data.userId,
            data.timestamp,
          );
        } // end of looping
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
    partnerId: number,
    codSupplierInvoiceId: string,
    supplierInvoiceStatusId: number,
    branchId: number,
    userId: number,
    timestamp: Date,
  ) {
    const obj = {
      partnerId,
      codSupplierInvoiceId,
      supplierInvoiceStatusId,
      branchId,
      userId,
      timestamp,
    };

    return CodUpdateSupplierInvoiceQueueService.queue.add(obj);
  }
}
