import { getManager } from 'typeorm';

import { CodBankStatement } from '../../../../shared/orm-entity/cod-bank-statement';
import { CodTransaction } from '../../../../shared/orm-entity/cod-transaction';
import { CodTransactionDetail } from '../../../../shared/orm-entity/cod-transaction-detail';
import { CodVoucher } from '../../../../shared/orm-entity/cod-voucher';
import { CodVoucherDetail } from '../../../../shared/orm-entity/cod-voucher-detail';
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

    const transactions = await CodTransaction.find({
      select: ['codTransactionId', 'transactionCode', 'totalCodValue', 'totalAwb', 'branchId'],
      where: {
        codBankStatementId: null,
        transactionType: 'CASHLESS',
        isDeleted: false,
      },
      take: 100,
    });

    for (const transaction of transactions) {
      const timestamp = moment().toDate();
      const codTransactionId = transaction.codTransactionId;
      const totalMatchQuery = `
        SELECT
          count(cvd.awb_number) AS "totalVoucher",
          count(ctd.awb_number) AS "totalData"
        FROM
          cod_voucher_detail cvd
          LEFT JOIN cod_transaction_detail ctd ON ctd.awb_number = cvd.awb_number
        WHERE ctd.cod_transaction_id = '${codTransactionId}'
        ;
      `;

      const dataTotalMatchQuery = await RawQueryService.query(totalMatchQuery);
      let dataTotalMatch = dataTotalMatchQuery ? dataTotalMatchQuery[0] : null;
      if (!dataTotalMatch) {
        dataTotalMatch = await RawQueryService.queryWithParams(totalMatchQuery, { codTransactionId });
      }

      if (dataTotalMatch && dataTotalMatch.totalVoucher === dataTotalMatch.totalData) {
        const transactionDetails = await CodTransactionDetail.find({
          select: ['codTransactionDetailId', 'awbNumber'],
          where: {
            codTransactionId,
            isDeleted: false,
          },
        });

        let isBankStatementCreated = false;

        for (const transactionDetail of transactionDetails) {
          const voucher = await CodVoucherDetail.findOne({
            select: ['codVoucherDetailId', 'codVoucherId', 'awbNumber'],
            where: {
              awbNumber: transactionDetail.awbNumber,
              isSettlement: false,
            },
          });

          const dataVoucher = await CodVoucher.findOne({
            select: ['codVoucherDate', 'codVoucherNo'],
            where: {
              codVoucherId: voucher.codVoucherId,
            },
          });
          const randomCode = await CustomCounterCode.bankStatement(
            timestamp,
          );

          if (voucher && dataVoucher) {
            await getManager().transaction(async transactionManager => {
              try {
                if (!isBankStatementCreated) {
                  isBankStatementCreated = await this.isBankStatementCreated(codTransactionId);
                }

                if (!isBankStatementCreated) {
                  // Create Bank Statement
                  console.log(`Creating Bank Statement for Awb Number === ${voucher.awbNumber}`);

                  const bankStatement = new CodBankStatement();
                  bankStatement.bankStatementCode = randomCode;
                  bankStatement.bankStatementDate = timestamp;
                  bankStatement.bankNoReference = dataVoucher.codVoucherNo;
                  bankStatement.transactionStatusId = TRANSACTION_STATUS.TRF;
                  bankStatement.totalCodValue = transaction.totalCodValue;
                  bankStatement.totalAwb = transaction.totalAwb;
                  bankStatement.branchId = transaction.branchId;
                  bankStatement.transferDatetime = dataVoucher.codVoucherDate;
                  // hardcode value, set default
                  bankStatement.bankAccount = 'BCA/2703935656';
                  bankStatement.totalTransaction = 1;
                  bankStatement.bankBranchId = 5;
                  bankStatement.userIdTransfer = 4;
                  bankStatement.userIdCreated = 4;
                  bankStatement.userIdUpdated = 4;
                  await transactionManager.save(CodBankStatement, bankStatement);

                  // Update Cod Bank Statement Id on its Cod Transaction
                  await transactionManager.update(
                    CodTransaction,
                    {
                      codTransactionId: transaction.codTransactionId,
                    },
                    {
                      codBankStatementId: bankStatement.codBankStatementId,
                      userIdUpdated: 4,
                      updatedTime: timestamp,
                    },
                  );
                }

                // Update Settlement Status on its Cod Voucher
                await transactionManager.update(
                  CodVoucherDetail,
                  {
                    codVoucherDetailId: voucher.codVoucherDetailId,
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
            console.log('### Voucher does not exist for awb number :: ', transactionDetail.awbNumber);
          }
        }
      } else {
        console.log('### Skip Process Transaction Data not complete :: ', transaction.transactionCode);
      }
    }

    console.log('########## STOP CRON FOR COD VOUCHER DIVA :: timeNow ==============  ', moment().toDate());
  }

  private static async isBankStatementCreated(codTransactionId: string): Promise<boolean> {
    const transaction = await CodTransaction.findOne({
      select: ['codBankStatementId'],
      where: {
        codTransactionId,
      },
    });

    if (transaction && transaction.codBankStatementId) {
      return true;
    }

    return false;
  }
}
