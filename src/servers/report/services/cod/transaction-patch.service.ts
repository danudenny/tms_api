import { TransactionPatchPayloadVm, TransactionPatchSuccessResponseVm } from '../../models/cod/transaction-patch.vm';
import { CodTransaction } from '../../../../shared/orm-entity/cod-transaction';
import { CodTransactionDetail } from '../../../../shared/orm-entity/cod-transaction-detail';
import moment = require('moment');

export class TransactionPatchService {
  constructor() {}

  static async remove(
    payload: TransactionPatchPayloadVm,
  ): Promise<TransactionPatchSuccessResponseVm> {

    const errorMsg = [];
    let totalSuccess = 0;
    for (const transactionCode of payload.data) {
      let message = null;
      if (transactionCode.length < 20) {
        const transParent = await CodTransaction.findOne({
          transactionCode,
          isDeleted: false,
        });
        if (transParent) {
          // get data detail
          const detail = await CodTransactionDetail.find({
            select: ['awbNumber'],
            where: {
                codTransactionId: transParent.codTransactionId,
                isDeleted: false,
              },
            },
          );
          // have data
          if (detail.length) {
            message = `Tidak valid no ${transactionCode}, ada relasi!`;
          } else {
            // remove transaction
            await CodTransaction.update(
              { codTransactionId: transParent.codTransactionId },
              {
                userIdUpdated: 1,
                updatedTime: moment().toDate(),
                isDeleted: true,
              },
            );
            totalSuccess += 1;
          }
        } else {
          message = `Kode transaksi ${transactionCode} tidak valid`;
        }
      } else {
        message = `Kode transaksi ${transactionCode} tidak valid`;
      }

      if (message) {
        errorMsg.push(message);
      }
    }

    const result = new TransactionPatchSuccessResponseVm();
    result.errors = errorMsg;
    result.message = `Update Status Success ${totalSuccess} Resi`;
    result.status = 200;
    return result;
  }
}
