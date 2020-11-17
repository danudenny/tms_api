// #region import
import { createQueryBuilder, getManager } from 'typeorm';

import { BadRequestException, ServiceUnavailableException } from '@nestjs/common';

import { BaseMetaPayloadVm } from '../../../../../shared/models/base-meta-payload.vm';
import { CodBankStatement } from '../../../../../shared/orm-entity/cod-bank-statement';
import { CodTransaction } from '../../../../../shared/orm-entity/cod-transaction';
import { CodTransactionDetail } from '../../../../../shared/orm-entity/cod-transaction-detail';
import { AttachmentService } from '../../../../../shared/services/attachment.service';
import { AuthService } from '../../../../../shared/services/auth.service';
import { CustomCounterCode } from '../../../../../shared/services/custom-counter-code.service';
import { MetaService } from '../../../../../shared/services/meta.service';
import { OrionRepositoryService } from '../../../../../shared/services/orion-repository.service';
import {
    WebCodBankStatementCancelPayloadVm, WebCodBankStatementValidatePayloadVm,
    WebCodTransferHeadOfficePayloadVm,
} from '../../../models/cod/web-awb-cod-payload.vm';
import {
    WebAwbCodBankStatementResponseVm, WebAwbCodListTransactionResponseVm, WebCodBankStatementResponseVm,
    WebCodTransactionDetailResponseVm, WebCodTransferHeadOfficeResponseVm,
} from '../../../models/cod/web-awb-cod-response.vm';

import moment = require('moment');
import { TRANSACTION_STATUS } from '../../../../../shared/constants/transaction-status.constant';
import { CodUpdateTransactionQueueService } from '../../../../queue/services/cod/cod-update-transaction-queue.service';
import { RedisService } from '../../../../../shared/services/redis.service';
import { v1 as uuidv1 } from 'uuid';
// #endregion
export class V1WebCodBankStatementService {

  static async transferHeadOffice(
    payload: WebCodTransferHeadOfficePayloadVm,
    file,
  ): Promise<WebCodTransferHeadOfficeResponseVm> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    const timestamp = moment().toDate();
    let attachmentId = null;
    const dataError = [];

    // validate data
    let redlock = true;
    for (const transactionId of payload.dataTransactionId) {
      // handle race condition
      redlock = await RedisService.redlock(`redlock:transferHeadOffice:${transactionId}`, 5);
      if (redlock == false) { break; }
    }
    if (!redlock) {
      throw new BadRequestException('Data Transaksi sedang di proses!!');
    }

    // upload file to aws s3
    if (file) {
      const uuidString = uuidv1();
      const attachment = await AttachmentService.uploadFileBufferToS3(
        file.buffer,
        uuidString,
        file.mimetype,
        'bank-statement',
      );
      if (attachment) {
        attachmentId = attachment.attachmentTmsId;
      } else {
        throw new BadRequestException('Gagal upload bukti transfer, coba ulangi lagi!');
      }
    } else {
      throw new BadRequestException('Harap inputkan bukti transfer!');
    }

    const randomCode = await CustomCounterCode.bankStatement(
      timestamp,
    );
    const bankAccount = await this.getBankAccount(payload.bankBranchId);
    const bankStatementNote = payload.bankStatementNote ? payload.bankStatementNote : null;
    let totalValue = 0;
    let totalData = 0;
    let totalAwb = 0;
    try {
      // #region transaction data
      await getManager().transaction(async transactionManager => {
        // create bank statement
        const bankStatement = new CodBankStatement();
        bankStatement.bankStatementCode = randomCode;
        bankStatement.bankStatementDate = timestamp;
        bankStatement.bankStatementNote = bankStatementNote;
        bankStatement.transactionStatusId = 33000;
        bankStatement.totalCodValue = totalValue; // init
        bankStatement.totalTransaction = totalData; // init
        bankStatement.totalAwb = totalAwb; // init
        bankStatement.bankBranchId = payload.bankBranchId;
        bankStatement.bankAccount = bankAccount;
        bankStatement.attachmentId = attachmentId;
        bankStatement.branchId = permissonPayload.branchId;
        bankStatement.bankNoReference = payload.bankNoReference;
        bankStatement.transferDatetime = timestamp;
        bankStatement.userIdTransfer = authMeta.userId;
        await transactionManager.save(CodBankStatement, bankStatement);

        // looping data transaction and update status and bank statement id [create new table] ??
        for (const transactionId of payload.dataTransactionId) {
          const codBranch = await CodTransaction.findOne({
            where: {
              codTransactionId: transactionId,
              codBankStatementId: null,
              isDeleted: false,
            },
          });
          if (codBranch) {
            totalData += 1;
            totalValue += Number(codBranch.totalCodValue);
            totalAwb += Number(codBranch.totalAwb);
            // update data
            await transactionManager.update(
              CodTransaction,
              {
                codTransactionId: codBranch.codTransactionId,
              },
              {
                codBankStatementId: bankStatement.codBankStatementId,
                transactionStatusId: 35000,
                userIdUpdated: authMeta.userId,
                updatedTime: timestamp,
              },
            );
            // NOTE: update transaction detail and history [35000]
            await transactionManager.update(
              CodTransactionDetail,
              {
                codTransactionId: codBranch.codTransactionId,
              },
              {
                transactionStatusId: 35000,
                userIdUpdated: authMeta.userId,
                updatedTime: timestamp,
              },
            );
            // send background process to insert history
            CodUpdateTransactionQueueService.perform(
              codBranch.codTransactionId,
              35000,
              permissonPayload.branchId,
              authMeta.userId,
              timestamp,
            );
          } else {
            dataError.push(`Transaction Id ${transactionId}, tidak valid! / sudah di proses`);
          }
        } // endof loop

        if (totalData > 0) {
          // update data bank statment
          await transactionManager.update(
            CodBankStatement,
            {
              codBankStatementId: bankStatement.codBankStatementId,
            },
            {
              totalCodValue: totalValue,
              totalTransaction: totalData,
              transactionStatusId: TRANSACTION_STATUS.TRF,
              totalAwb,
              updatedTime: timestamp,
              userIdUpdated: authMeta.userId,
            },
          );
        }
      });
      // #endregion of transaction

      // response
      const result = new WebCodTransferHeadOfficeResponseVm();
      result.status = 'ok';
      result.message = 'success';
      result.dataError = dataError;
      return result;

    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  static async transactionBranchByBankStatementId(
    id: string,
  ): Promise<WebAwbCodListTransactionResponseVm> {
    const qb = createQueryBuilder();
    qb.addSelect('t1.cod_transaction_id', 'transactionId');
    qb.addSelect('t1.transaction_code', 'transactionCode');
    qb.addSelect('t1.transaction_date', 'transactionDate');
    qb.addSelect('t1.transaction_type', 'transactionType');
    qb.addSelect('t1.transaction_status_id', 'transactionStatusId');
    qb.addSelect('t2.status_title', 'transactionStatus');
    qb.addSelect('t1.total_awb', 'totalAwb');
    qb.addSelect('t1.total_cod_value', 'totalCodValue');
    qb.addSelect('t3.branch_name', 'branchName');
    qb.addSelect('t4.first_name', 'adminName');

    qb.from('cod_transaction', 't1');
    qb.innerJoin(
      'transaction_status',
      't2',
      't1.transaction_status_id = t2.transaction_status_id AND t2.is_deleted = false',
    );
    qb.innerJoin(
      'branch',
      't3',
      't1.branch_id = t3.branch_id AND t3.is_deleted = false',
    );
    qb.innerJoin(
      'users',
      't4',
      't1.user_id_updated = t4.user_id AND t4.is_deleted = false',
    );
    qb.where('t1.cod_bank_statement_id = :id', { id });
    qb.andWhere('t1.is_deleted = false');

    const data = await qb.getRawMany();
    if (data.length) {
      const result = new WebAwbCodListTransactionResponseVm();
      result.data = data;
      return result;
    } else {
      throw new BadRequestException('Data tidak ditemukan!');
    }
  }

  static async transactionBranchDetailByBankStatementId(
    id: string,
  ): Promise<WebCodTransactionDetailResponseVm> {
    // awb number | method | penerima | nilai cod
    const qb = createQueryBuilder();
    qb.addSelect('t1.awb_number', 'awbNumber');
    qb.addSelect('t1.payment_method', 'paymentMethod');
    qb.addSelect('t1.consignee_name', 'consigneeName');
    qb.addSelect('t1.cod_value', 'codValue');

    qb.from('cod_transaction_detail', 't1');
    qb.innerJoin(
      'cod_transaction',
      't2',
      't1.cod_transaction_id = t2.cod_transaction_id AND t2.is_deleted = false',
    );
    qb.where('t2.cod_bank_statement_id = :id', { id });
    qb.andWhere('t1.is_deleted = false');

    const data = await qb.getRawMany();
    if (data.length) {
      const result = new WebCodTransactionDetailResponseVm();
      result.data = data;
      return result;
    } else {
      throw new BadRequestException('Data tidak ditemukan!');
    }
  }

  static async bankStatement(
    payload: BaseMetaPayloadVm,
  ): Promise<WebAwbCodBankStatementResponseVm> {
    // mapping field
    payload.fieldResolverMap['transactionStatus'] = 't2.status_title';
    payload.fieldResolverMap['adminName'] = 't4.first_name';
    payload.fieldResolverMap['transferName'] = 't6.first_name';
    payload.fieldResolverMap['transactionStatusId'] = 't1.transaction_status_id';
    payload.fieldResolverMap['branchIdLast'] = 't1.branch_id';
    payload.fieldResolverMap['districtId'] = 't3.district_id';
    payload.fieldResolverMap['representativeId'] = 't3.representative_id';

    if (payload.sortBy === '') {
      payload.sortBy = 'bankStatementDate';
    }

    const repo = new OrionRepositoryService(CodBankStatement, 't1');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['t1.cod_bank_statement_id', 'bankStatementId'],
      ['t1.bank_statement_code', 'bankStatementCode'],
      ['t1.bank_statement_date', 'bankStatementDate'],
      ['t1.bank_statement_note', 'bankStatementNote'],
      ['t1.transaction_status_id', 'transactionStatusId'],
      ['t1.bank_account', 'bankAccount'],
      ['t2.status_title', 'transactionStatus'],
      ['t1.bank_no_reference', 'bankNoReference'],
      ['t1.total_transaction', 'totalTransaction'],
      ['t1.total_awb', 'totalAwb'],
      ['t1.total_cod_value', 'totalCodValue'],
      ['t1.validate_datetime', 'validateDatetime'],
      ['t1.cancel_datetime', 'cancelDatetime'],
      ['t1.transfer_datetime', 'transferDatetime'],
      ['t1.user_id_transfer', 'userIdTransfer'],
      ['t6.first_name', 'transferName'],
      ['t3.branch_name', 'branchName'],
      ['t4.first_name', 'adminName'],
      ['t5.url', 'attachmentUrl'],
    );

    q.innerJoin(e => e.transactionStatus, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.branch, 't3', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.userAdmin, 't4', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.leftJoin(e => e.attachment, 't5', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.userTransfer, 't6', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.andWhere(e => e.isDeleted, w => w.isFalse());
    q.andWhere(
      e => e.transactionStatusId,
      w => w.notEquals(TRANSACTION_STATUS.CANHO),
    );

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new WebAwbCodBankStatementResponseVm();

    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  static async bankStatementValidate(
    payload: WebCodBankStatementValidatePayloadVm,
  ): Promise<WebCodBankStatementResponseVm> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    const timestamp = moment().toDate();
    // validate data
    const bankStatement = await CodBankStatement.findOne({
      select: ['codBankStatementId'],
      where: {
        codBankStatementId: payload.bankStatementId,
        transactionStatusId: 35000,
        isDeleted: false,
      },
    });

    if (!bankStatement) {
      throw new BadRequestException('Data tidak ditemukan/sudah di proses!');
    }

    const transactionNote = payload.transactionNote ? payload.transactionNote : null;

    try {
      // TODO: process validate bank statement
      // #region transaction data
      await getManager().transaction(async transactionManager => {
        // update data bank statment
        await transactionManager.update(
          CodBankStatement,
          {
            codBankStatementId: payload.bankStatementId,
          },
          {
            transactionStatusId: 40000,
            transferDatetime: moment(payload.transferDatetime).toDate(),
            validateDatetime: timestamp,
            updatedTime: timestamp,
            userIdUpdated: authMeta.userId,
          },
        );

        // update transaction branch
        await transactionManager.update(
          CodTransaction,
          {
            codBankStatementId: payload.bankStatementId,
          },
          {
            transactionStatusId: 40000,
            transactionNote,
            updatedTime: timestamp,
            userIdUpdated: authMeta.userId,
          },
        );

        // looping data transaction branch
        const transactionsBranch = await transactionManager.find(
          CodTransaction,
          {
            where: {
              codBankStatementId: payload.bankStatementId,
              isDeleted: false,
            },
          },
        );
        if (transactionsBranch.length) {
          for (const item of transactionsBranch) {
            await transactionManager.update(
              CodTransactionDetail,
              {
                codTransactionId: item.codTransactionId,
                isDeleted: false,
              },
              {
                transactionStatusId: 40000,
                updatedTime: timestamp,
                userIdUpdated: authMeta.userId,
              },
            );

            // NOTE: add transaction history [40000]
            // send background process to insert history
            CodUpdateTransactionQueueService.perform(
              item.codTransactionId,
              40000,
              permissonPayload.branchId,
              authMeta.userId,
              timestamp,
            );
          }
        }

      });
      // #endregion of transaction
      const result = new WebCodBankStatementResponseVm();
      result.status = 'ok';
      result.message = 'success';
      return result;
    } catch (error) {
      throw new ServiceUnavailableException(error.message);
    }
  }

  static async bankStatementCancel(
    payload: WebCodBankStatementCancelPayloadVm,
  ): Promise<WebCodBankStatementResponseVm> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    const timestamp = moment().toDate();
    // validate data
    const bankStatement = await CodBankStatement.findOne({
      select: ['codBankStatementId'],
      where: {
        codBankStatementId: payload.bankStatementId,
        transactionStatusId: 35000,
        isDeleted: false,
      },
    });

    if (!bankStatement) {
      throw new BadRequestException('Data tidak ditemukan/sudah di proses!');
    }

    const transactionNote = payload.transactionNote ? payload.transactionNote : null;
    if (!transactionNote) {
      throw new BadRequestException('transactionNote tidak disediakan!');
    }

    try {
      // TODO: process cancel bank statement
      // #region transaction data
      await getManager().transaction(async transactionManager => {
        // update data bank statment
        await transactionManager.update(
          CodBankStatement,
          {
            codBankStatementId: payload.bankStatementId,
          },
          {
            transactionStatusId: 32500,
            cancelDatetime: timestamp,
            updatedTime: timestamp,
            userIdUpdated: authMeta.userId,
          },
        );

        // looping data transaction branch
        const transactionsBranch = await transactionManager.find(
          CodTransaction,
          {
            where: {
              codBankStatementId: payload.bankStatementId,
              isDeleted: false,
            },
          },
        );
        if (transactionsBranch.length) {
          for (const item of transactionsBranch) {
            await transactionManager.update(
              CodTransactionDetail,
              {
                codTransactionId: item.codTransactionId,
                isDeleted: false,
              },
              {
                transactionStatusId: 32500,
                updatedTime: timestamp,
                userIdUpdated: authMeta.userId,
              },
            );

            // TODO: add transaction history [32500]
            // send background process to insert history
            CodUpdateTransactionQueueService.perform(
              item.codTransactionId,
              32500,
              permissonPayload.branchId,
              authMeta.userId,
              timestamp,
            );
          }

          // update transaction branch
          await transactionManager.update(
            CodTransaction,
            {
              codBankStatementId: payload.bankStatementId,
            },
            {
              transactionStatusId: 32500,
              codBankStatementId: null,
              transactionNote,
              updatedTime: timestamp,
              userIdUpdated: authMeta.userId,
            },
          );
        }
      });
      // #endregion of transaction

      const result = new WebCodBankStatementResponseVm();
      result.status = 'ok';
      result.message = 'success';
      return result;

    } catch (error) {
      throw new ServiceUnavailableException(error.message);
    }
  }

  private static async getBankAccount(bankBranchId: number): Promise<string> {
    const qb = createQueryBuilder();
    qb.addSelect('t1.account_number', 'accountNumber');
    qb.addSelect('t2.bank_code', 'bankCode');
    qb.from('bank_branch', 't1');
    qb.innerJoin(
      'bank',
      't2',
      't1.bank_id = t2.bank_id AND t2.is_deleted = false',
    );
    qb.where('t1.bank_branch_id = :bankBranchId', { bankBranchId });
    qb.andWhere('t1.is_deleted = false');

    const bankBranch = await qb.getRawOne();
    if (bankBranch) {
      return `${bankBranch.bankCode}/${bankBranch.accountNumber}`;
    } else {
      throw new BadRequestException('Data bank tidak valid/tidak ditemukan!');
    }
  }
}
