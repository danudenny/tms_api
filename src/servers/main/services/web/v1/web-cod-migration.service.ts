import { BadRequestException } from '@nestjs/common';

import { AWB_STATUS } from '../../../../../shared/constants/awb-status.constant';
import { TRANSACTION_STATUS } from '../../../../../shared/constants/transaction-status.constant';
import { AwbItemAttr } from '../../../../../shared/orm-entity/awb-item-attr';
import { CodTransaction } from '../../../../../shared/orm-entity/cod-transaction';
import { User } from '../../../../../shared/orm-entity/user';
import { CustomCounterCode } from '../../../../../shared/services/custom-counter-code.service';
import {
    CodFirstTransactionQueueService,
} from '../../../../queue/services/cod/cod-first-transaction-queue.service';
import {
    WebCodMigrationTransferBranchResponseVm, WebCodMigrationTransferPayloadVm,
} from '../../../models/cod/web-awb-cod-migration.vm';
import { WebCodFirstTransactionPayloadVm } from '../../../models/cod/web-awb-cod-payload.vm';

import moment = require('moment');

export class V1WebCodMigrationService {

  static async transferBranch(
    payload: WebCodMigrationTransferPayloadVm,
  ): Promise<WebCodMigrationTransferBranchResponseVm> {

    const timestamp = moment().toDate();
    let totalCodValue = 0;
    let totalAwbCash = 0;
    const dataError = [];

    // find user by nik
    const userDriver = await User.findOne({
      where: {
        username: payload.nikDriver,
        isDeleted: false,
      },
    });

    if (!userDriver) {
      throw new BadRequestException('Data Driver Sigesit tidak ditemukan!');
    }

    // #region data cash
    const codBranchCash = new CodTransaction();
    const randomCode = await CustomCounterCode.transactionCodBranch(timestamp);
    codBranchCash.transactionCode = randomCode;
    codBranchCash.transactionDate = timestamp;
    codBranchCash.transactionStatusId = 27500; // status process;
    codBranchCash.transactionType = 'CASH';
    codBranchCash.totalCodValue = totalCodValue;
    codBranchCash.totalAwb = totalAwbCash;
    codBranchCash.branchId = 121; // kantor pusat
    codBranchCash.userIdDriver = userDriver.userId;
    codBranchCash.userIdCreated = 1;
    codBranchCash.userIdUpdated = 1;
    codBranchCash.createdTime = timestamp;
    codBranchCash.updatedTime = timestamp;
    await CodTransaction.save(codBranchCash);

    for (const item of payload.data) {
      const awbValid = await this.validStatusAwb(item.awbNumber);
      if (awbValid) {
        totalCodValue += Number(item.codValue);
        totalAwbCash += 1;

        // send to background process
        await this.handleAwbCod(
          awbValid.awbItemId,
          awbValid.awbNumber,
          codBranchCash.codTransactionId,
          userDriver.userId,
        );

      } else {
        // NOTE: error message
        const errorMessage = `status resi ${
          item.awbNumber
        } tidak valid, mohon di cek ulang!`;
        dataError.push(errorMessage);
      }
    } // end of loop data cash

    // update data
    await CodTransaction.update(
      {
        codTransactionId: codBranchCash.codTransactionId,
      },
      {
        totalCodValue,
        totalAwb: totalAwbCash,
        transactionStatusId: 31000,
      },
    );

    // #endregion data cash

    const result = new WebCodMigrationTransferBranchResponseVm();
    result.transactionId = codBranchCash.codTransactionId;
    result.dataError = dataError;
    return result;
  }

  // func private ==============================================================
  private static async handleAwbCod(
    awbItemId: number,
    awbNumber: string,
    transctiontId: string,
    userIdDriver: number,
  ): Promise<boolean> {

    // update awb_item_attr transaction status 3100
    await AwbItemAttr.update(
      { awbItemId },
      {
        transactionStatusId: TRANSACTION_STATUS.TRM,
      },
    );

    // #region send to background process with bull
    const firstTransaction = new WebCodFirstTransactionPayloadVm();
    firstTransaction.awbItemId = awbItemId;
    firstTransaction.awbNumber = awbNumber;
    firstTransaction.codTransactionId = transctiontId;
    firstTransaction.transactionStatusId = 31000;
    firstTransaction.supplierInvoiceStatusId = null;
    firstTransaction.codSupplierInvoiceId = null;

    firstTransaction.paymentMethod = 'cash';
    firstTransaction.paymentService = null;
    firstTransaction.noReference = null;
    firstTransaction.branchId = 121; // kantor pusat
    firstTransaction.userId = 1; // admin
    firstTransaction.userIdDriver = userIdDriver;
    CodFirstTransactionQueueService.perform(firstTransaction, moment().toDate());
    // #endregion send to background

    // response
    return true;
  }

  private static async validStatusAwb(awbNumber: string): Promise<{
    awbItemAttrId: string,
    awbItemId: number,
    awbNumber: string,
    awbStatusIdLast: number,
  }> {
    // check awb status mush valid dlv
    const awbValid = await AwbItemAttr.findOne({
      select: [
        'awbItemAttrId',
        'awbItemId',
        'awbNumber',
        'awbStatusIdLast',
      ],
      where: {
        awbNumber,
        awbStatusIdLast: AWB_STATUS.DLV,
        isDeleted: false,
      },
    });

    return awbValid;
  }
}
