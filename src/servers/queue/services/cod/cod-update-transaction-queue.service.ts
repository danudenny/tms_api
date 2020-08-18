import { CodTransactionDetail } from '../../../../shared/orm-entity/cod-transaction-detail';
import { ConfigService } from '../../../../shared/services/config.service';
import { MongoDbConfig } from '../../config/database/mongodb.config';
import { QueueBullBoard } from '../queue-bull-board';
import { CodTransactionHistoryQueueService } from './cod-transaction-history-queue.service';
import { TRANSACTION_STATUS } from '../../../../shared/constants/transaction-status.constant';
import { AwbItemAttr } from '../../../../shared/orm-entity/awb-item-attr';
import { User } from '../../../../shared/orm-entity/user';
import moment = require('moment');

export class CodUpdateTransactionQueueService {
  public static queue = QueueBullBoard.createQueue.add(
    'cod-update-transaction-queue',
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

      const dataTransaction = await CodTransactionDetail.find({
        select: ['awbNumber', 'awbItemId'],
        where: {
          codTransactionId: data.codTransactionId,
          isDeleted: false,
        },
      });
      console.log('##### TOTAL DATA Transaction :: ', dataTransaction.length);

      if (dataTransaction.length) {
        for (const item of dataTransaction) {

          // update awb_item_attr transaction status 3500
          if (Number(data.transactionStatusId) == TRANSACTION_STATUS.TRF) {
            await AwbItemAttr.update(
              { awbItemId: item.awbItemId },
              {
                transactionStatusId: TRANSACTION_STATUS.TRF,
              },
            );
          }

          CodTransactionHistoryQueueService.perform(
            item.awbItemId,
            item.awbNumber,
            data.transactionStatusId,
            data.branchId,
            data.userId,
            data.timestamp,
          );
        } // end of looping
      }

      // get config mongodb
      const collection = await MongoDbConfig.getDbSicepatCod(
        'transaction_detail',
      );
      // Update data mongo
      // Get user updated
      const userUpdated = await User.findOne({
        select: ['firstName', 'username'],
        where: {
          userId: Number(data.userId),
          isDeleted: false,
        },
      });
      // query store the search condition
      const query = { codTransactionId: data.codTransactionId };
      // data stores the updated value
      const dataUpdate = {
        $set: {
          transactionStatusId: Number(data.transactionStatusId),
          userIdUpdated: Number(data.userId),
          updatedTime: moment(data.timestamp).toDate(),
          adminName: userUpdated.firstName,
          nikAdmin: userUpdated.username,
        },
      };
      try {
        console.log('## Update MongoDb :: ', dataUpdate);
        const updateMongo = await collection.updateMany(query, dataUpdate);
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
    codTransactionId: string,
    transactionStatusId: number,
    branchId: number,
    userId: number,
    timestamp: Date,
  ) {
    const obj = {
      codTransactionId,
      transactionStatusId,
      branchId,
      userId,
      timestamp,
    };

    return CodUpdateTransactionQueueService.queue.add(obj);
  }
}
