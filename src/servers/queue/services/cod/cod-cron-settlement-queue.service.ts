import { QueueBullBoard } from '../queue-bull-board';
import moment = require('moment');
import { CodBankStatement } from 'src/shared/orm-entity/cod-bank-statement';
import { CodVoucherDetail } from 'src/shared/orm-entity/cod-voucher-detail';
import { CodTransactionDetail } from 'src/shared/orm-entity/cod-transaction-detail';
import { CodTransaction } from 'src/shared/orm-entity/cod-transaction';
import { CustomCounterCode } from 'src/shared/services/custom-counter-code.service';
import { getManager } from 'typeorm';

// DOC: this sample Cron with bull
// https://docs.bullmq.io/guide/jobs/repeatable
// https://github.com/OptimalBits/bull/blob/c23ed7477a65ac11c964ccf95ef0a4a91944e87c/REFERENCE.md

export class CodCronSettlementQueueService {
  public static queue = QueueBullBoard.createQueue.add(
    'cod-cron-settlement-queue',
    {
      defaultJobOptions: {
        attempts: 3,
        timeout: 1000 * 60 * 10,
      },
    },
  );

  public static init() {
    // NOTE: Concurrency defaults to 1 if not specified.
    this.queue.process(async (job, done) => {

      // const data = job.data;

      console.log('########## RUN CRON FOR COD VOUCHER DIVA :: timeNow ==============  ', moment().toDate());
      try {
        await this.logicCron();
        done();
      } catch (error) {
        throw new Error(error);
      }

    });

    this.queue.on('completed', job => {
      // cleans all jobs that completed over 5 seconds ago.
      this.queue.clean(5000);
      console.log(`Job with id ${job.id} has been completed`);
    });

    this.queue.on('cleaned', function(job, type) {
      console.log('Cleaned %s %s jobs', job.length, type);
    });

    // start cron
    // https://crontab.guru/
    // NOTE: sample cron every minute
    this.queue.add(null, {
      repeat: {
        cron: '*/1 * * * *',
      },
    });
  }

  private static async logicCron() {

    const timestamp = moment().toDate();
    const vouchers = await CodVoucherDetail.find({
      where: {
        isSettlement: false
      }
    });

    for (const voucher of vouchers) {
      const transaction = await this.getTransactionByAwbNumber(voucher.awbNumber);

      if (transaction) {
        const randomCode = await CustomCounterCode.bankStatement(
          timestamp,
        );

        await getManager().transaction(async transactionManager => {
          try {
            // Create Bank Statement
            console.log(`Creating Bank Statement for Awb Number === ${voucher.awbNumber}`);

            const bankStatement = new CodBankStatement();
            bankStatement.bankStatementCode = randomCode;
            bankStatement.bankStatementDate = timestamp;
            bankStatement.transactionStatusId = 35000;
            bankStatement.totalCodValue = transaction.totalCodValue;
            bankStatement.totalTransaction = 1;
            bankStatement.totalAwb = transaction.totalAwb;
            bankStatement.bankBranchId = 5;
            bankStatement.bankAccount = 'BCA/000000012435251';
            bankStatement.branchId = transaction.branchId;
            bankStatement.transferDatetime = timestamp;
            bankStatement.userIdTransfer = transaction.userIdCreated;
            bankStatement.userIdCreated = transaction.userIdCreated;
            bankStatement.userIdUpdated = transaction.userIdCreated;
            await transactionManager.save(CodBankStatement, bankStatement);

            // Update Cod Bank Statement Id on its Cod Transaction
            await transactionManager.update(
              CodTransaction,
              {
                codTransactionId: transaction.codTransactionId,
              },
              {
                codBankStatementId: bankStatement.codBankStatementId,
                userIdUpdated: transaction.userIdCreated,
                updatedTime: timestamp
              },
            );

            // Update Settlement Status on its Cod Voucher
            await transactionManager.update(
              CodVoucherDetail,
              {
                codVoucherDetailId: voucher.codVoucherDetailId,
              },
              {
                isSettlement: true,
                updatedTime: timestamp
              },
            );
          } catch (error) {
            console.log(error);
          }
        });
      }
    }

    console.log('########## STOP CRON FOR COD VOUCHER DIVA :: timeNow ==============  ', moment().toDate());
  }

  private static async getTransactionByAwbNumber(awbNumber: string): Promise<CodTransaction | null> {
    // check transaction exists by its awb number
    const transactionDetail = await CodTransactionDetail.findOne({
      select: [ 'codTransactionId' ],
      where: {
        awbNumber,
        isDeleted: false
      },
    });

    if (!transactionDetail) return null;

    const transaction = await CodTransaction.findOne({
      select: [ 'totalCodValue', 'totalAwb', 'branchId', 'userIdCreated', 'codTransactionId' ],
      where: {
        codTransactionId: transactionDetail.codTransactionId,
        codBankStatementId: null,
        transactionType: 'CASHLESS',
        isDeleted: false
      }
    });

    if (transaction) {
      return transaction;
    }
    
    return null;
  }
}
