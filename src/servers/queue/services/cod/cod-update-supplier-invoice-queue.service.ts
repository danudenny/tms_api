import { CodTransactionDetail } from '../../../../shared/orm-entity/cod-transaction-detail';
import { ConfigService } from '../../../../shared/services/config.service';
import { MongoDbConfig } from '../../config/database/mongodb.config';
import { QueueBullBoard } from '../queue-bull-board';
import { User } from '../../../../shared/orm-entity/user';
import { CodTransactionHistoryQueueService } from './cod-transaction-history-queue.service';
import moment = require('moment');
import { TRANSACTION_STATUS } from '../../../../shared/constants/transaction-status.constant';

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

      let partialDraftInvoice: boolean = false;
      // Update data mongo
      // #region mongodb
      const collection = await MongoDbConfig.getDbSicepatCod(
        'transaction_detail',
      );
      // Get user updated
      const userUpdated = await User.findOne({
        select: ['userId', 'firstName', 'username'],
        where: {
          userId: Number(data.userId),
          isDeleted: false,
        },
        cache: true,
      });
      const supplierInvoiceStatusId = Number(data.supplierInvoiceStatusId);
      // Update Many for status invoice 45000 [PAID]
      if (supplierInvoiceStatusId == TRANSACTION_STATUS.PAIDHO) {
        // query store the search condition
        const query = { codSupplierInvoiceId: data.codSupplierInvoiceId };
        // data stores the updated value
        const dataUpdate = {
          $set: {
            supplierInvoiceStatusId,
            userIdUpdated: Number(data.userId),
            updatedTime: moment(data.timestamp).toDate(),
            adminName: userUpdated.firstName,
            nikAdmin: userUpdated.username,
          },
        };
        try {
          console.log('## Update MongoDb :: ', dataUpdate);
          await collection.updateMany(query, dataUpdate);
        } catch (error) {
          console.error(error);
          throw error;
        }

      } else {
        // Draft Invoice partial update data sync to mongo 41000 [DRAFT]
        partialDraftInvoice = true;
      }
      // #endregion

      const dataTransaction = await CodTransactionDetail.find({
        select: ['awbNumber', 'awbItemId'],
        where: {
          codSupplierInvoiceId: data.codSupplierInvoiceId,
          isDeleted: false,
        },
      });

      if (dataTransaction && dataTransaction.length) {
        console.log('##### TOTAL DATA Transaction :: ', dataTransaction.length);
        // object update for draft invoice
        const objUpdate = {
          codSupplierInvoiceId: data.codSupplierInvoiceId,
          supplierInvoiceStatusId,
          userIdUpdated: Number(data.userId),
          updatedTime: moment(data.timestamp).toDate(),
          adminName: userUpdated.firstName,
          nikAdmin: userUpdated.username,
        };

        for (const item of dataTransaction) {
          // update data mongo draft invoice
          if (partialDraftInvoice) {
            try {
              const res = await collection.findOneAndUpdate(
                { _id: item.awbNumber },
                {
                  $set: objUpdate,
                },
              );
            } catch (error) {
              console.error(error);
            }
          }

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
