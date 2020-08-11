import { getManager } from 'typeorm';

import { CodBankStatement } from '../../../../shared/orm-entity/cod-bank-statement';
import { CodTransaction } from '../../../../shared/orm-entity/cod-transaction';
import { CodTransactionDetail } from '../../../../shared/orm-entity/cod-transaction-detail';
import { CodVoucher } from '../../../../shared/orm-entity/cod-voucher';
import { CustomCounterCode } from '../../../../shared/services/custom-counter-code.service';
import { QueueBullBoard } from '../queue-bull-board';
import { TRANSACTION_STATUS } from '../../../../shared/constants/transaction-status.constant';
import moment = require('moment');
import { RawQueryService } from '../../../../shared/services/raw-query.service';

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
    // clean current job delayed
    this.queue.clean(0, 'delayed');

    // NOTE: Concurrency defaults to 1 if not specified.
    this.queue.process(1, async (job, done) => {

      // const data = job.data;

      console.log('########## RUN CRON FOR COD VOUCHER DIVA :: timeNow ==============  ', moment().toDate());
      try {
        await this.logicCron();
        done();
      } catch (error) {
        console.error(error);
        done(error);
      }

    });

    // this.queue.on('completed', job => {
    //   // cleans all jobs that completed over 5 seconds ago.
    //   this.queue.clean(5000);
    //   console.log(`Job with id ${job.id} has been completed`);
    // });

    this.queue.on('cleaned', function(job, type) {
      console.log('Cleaned %s %s jobs', job.length, type);
    });

    // start cron
    // https://crontab.guru/
    // NOTE: sample cron every 10 minute
    this.queue.add(
      {},
      {
        repeat: {
          cron: '*/10 * * * *',
        },
        removeOnComplete: true,
        removeOnFail: false,
      });

  }

  private static async logicCron() {

    const vouchers = await CodVoucher.find({
      select: ['codVoucherId', 'codVoucherNo', 'codVoucherDate'],
      where: {
        isSettlement: false,
      },
      take: 100,
    });

    for (const voucher of vouchers) {
      const timestamp = moment().toDate();
      const codVoucherId = voucher.codVoucherId;
      const totalMatchQuery = `
        SELECT
          count(cvd.awb_number) AS “totalVoucher”,
          count(ctd.awb_number) AS “totalData”,
          sum(ctd.cod_value) AS “totalCodValue”
        FROM
          cod_voucher_detail cvd
          LEFT JOIN cod_transaction_detail ctd ON ctd.awb_number = cvd.awb_number
        WHERE cvd.cod_voucher_id = :codVoucherId;
      `;

      const dataTotalMatch = await RawQueryService.queryWithParams(totalMatchQuery, { codVoucherId });
      const dataTotal = dataTotalMatch ? dataTotalMatch[0] : null;
      if (dataTotal && dataTotal.totalVoucher === dataTotal.totalData) {
        const transactionDetailQuery = `
          SELECT
            cvd.awb_number AS “awbVoucher”,
            ctd.*
          FROM
            cod_voucher_detail cvd
            LEFT JOIN cod_transaction_detail ctd ON ctd.awb_number = cvd.awb_number
          WHERE cvd.cod_voucher_id = :codVoucherId;
        `;
        const transactionDetails = await RawQueryService.queryWithParams(transactionDetailQuery, { codVoucherId });
        if (transactionDetails) {
          await getManager().transaction(async transactionManager => {
            try {
              // Create New Transaction
              console.log(`Creating New Transaction for Voucher No === ${voucher.codVoucherNo}`);

              const newTransaction = new CodTransaction();
              const randomCode = await CustomCounterCode.transactionCodBranch(
                timestamp,
              );
              newTransaction.transactionCode = randomCode;
              newTransaction.transactionDate = timestamp;
              newTransaction.transactionStatusId = TRANSACTION_STATUS.TRF;
              newTransaction.totalCodValue = dataTotal.totalCodValue;
              newTransaction.totalAwb = dataTotal.totalVoucher;
              // hardcode value, set default
              newTransaction.transactionType = 'CASHLESS';
              newTransaction.branchId = 121;
              newTransaction.userIdDriver = 1;
              await transactionManager.save(CodTransaction, newTransaction);

              for (const transaction of transactionDetails) {
                if (transaction.codTransactionDetailId) {
                  await transactionManager.update(
                    CodTransactionDetail,
                    {
                      codTransactionDetailId: transaction.codTransactionDetailId,
                    },
                    {
                      codTransactionId: newTransaction.codTransactionId,
                      transactionStatusId: newTransaction.transactionStatusId,
                      userIdUpdated: 4,
                      updatedTime: timestamp,
                    },
                  );
                } else {
                  console.log('### Transaction Detail does not exist for awb voucher :: ', transaction.awbVoucher);
                }
              }

              // Create Bank Statement
              console.log(`Creating Bank Statement for Voucher No === ${voucher.codVoucherNo}`);

              const randomCodeBankStatement = await CustomCounterCode.bankStatement(
                timestamp,
              );
              const bankStatement = new CodBankStatement();
              bankStatement.bankStatementCode = randomCodeBankStatement;
              bankStatement.bankStatementDate = timestamp;
              bankStatement.bankNoReference = voucher.codVoucherNo;
              bankStatement.transactionStatusId = TRANSACTION_STATUS.TRF;
              bankStatement.totalCodValue = newTransaction.totalCodValue;
              bankStatement.totalAwb = newTransaction.totalAwb;
              bankStatement.branchId = newTransaction.branchId;
              bankStatement.transferDatetime = voucher.codVoucherDate;
              // hardcode value, set default
              bankStatement.bankAccount = 'BCA/2703935656';
              bankStatement.totalTransaction = 1;
              bankStatement.bankBranchId = 5;
              bankStatement.userIdTransfer = 4;
              bankStatement.userIdCreated = 4;
              bankStatement.userIdUpdated = 4;
              await transactionManager.save(CodBankStatement, bankStatement);

              // Update Cod Bank Statement Id for its Cod Transaction
              await transactionManager.update(
                CodTransaction,
                {
                  codTransactionId: newTransaction.codTransactionId,
                },
                {
                  codBankStatementId: bankStatement.codBankStatementId,
                  userIdUpdated: 4,
                  updatedTime: timestamp,
                },
              );

              // Update Settlement Status for its Cod Voucher
              await transactionManager.update(
                CodVoucher,
                {
                  codVoucherId: voucher.codVoucherId,
                },
                {
                  isSettlement: true,
                  updatedTime: timestamp,
                },
              );
            } catch (error) {
              console.log(error);
            }
          });
        } else {
          console.log('### Transaction Detail is empty for Voucher No :: ', voucher.codVoucherNo);
        }
      } else {
        console.log('### Skip Process Voucher Data not complete for Voucher No :: ', voucher.codVoucherNo);
      }
    }

    console.log('########## STOP CRON FOR COD VOUCHER DIVA :: timeNow ==============  ', moment().toDate());
  }
}
