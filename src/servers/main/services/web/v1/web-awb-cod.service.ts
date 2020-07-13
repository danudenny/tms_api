// #region import
import { createQueryBuilder, getManager, Not } from 'typeorm';

import { BadRequestException, ServiceUnavailableException } from '@nestjs/common';

import { AWB_STATUS } from '../../../../../shared/constants/awb-status.constant';
import { BaseMetaPayloadVm } from '../../../../../shared/models/base-meta-payload.vm';
import { AwbItemAttr } from '../../../../../shared/orm-entity/awb-item-attr';
import { Branch } from '../../../../../shared/orm-entity/branch';
import { CodBankStatement } from '../../../../../shared/orm-entity/cod-bank-statement';
import { CodTransaction } from '../../../../../shared/orm-entity/cod-transaction';
import { CodTransactionDetail } from '../../../../../shared/orm-entity/cod-transaction-detail';
import { User } from '../../../../../shared/orm-entity/user';
import { AttachmentService } from '../../../../../shared/services/attachment.service';
import { AuthService } from '../../../../../shared/services/auth.service';
import { CustomCounterCode } from '../../../../../shared/services/custom-counter-code.service';
import { MetaService } from '../../../../../shared/services/meta.service';
import { OrionRepositoryService } from '../../../../../shared/services/orion-repository.service';
import {
    CodFirstTransactionQueueService,
} from '../../../../queue/services/cod/cod-first-transaction-queue.service';
import {
    WebCodAwbPayloadVm, WebCodBankStatementCancelPayloadVm, WebCodBankStatementValidatePayloadVm,
    WebCodFirstTransactionPayloadVm, WebCodTransferHeadOfficePayloadVm, WebCodTransferPayloadVm,
} from '../../../models/cod/web-awb-cod-payload.vm';
import {
    PrintCodTransferBranchVm, WebAwbCodBankStatementResponseVm, WebAwbCodListResponseVm,
    WebAwbCodListTransactionResponseVm, WebCodAwbPrintVm, WebCodBankStatementResponseVm,
    WebCodPrintMetaVm, WebCodTransactionDetailResponseVm, WebCodTransferBranchResponseVm,
    WebCodTransferHeadOfficeResponseVm,
} from '../../../models/cod/web-awb-cod-response.vm';
import { PrintByStoreService } from '../../print-by-store.service';

import moment = require('moment');
import { TRANSACTION_STATUS } from '../../../../../shared/constants/transaction-status.constant';
// #endregion
export class V1WebAwbCodService {

  static async awbCod(
    payload: BaseMetaPayloadVm,
  ): Promise<WebAwbCodListResponseVm> {
    // mapping field
    payload.fieldResolverMap['awbNumber'] = 't1.awb_number';
    payload.fieldResolverMap['codValue'] = 't2.total_cod_value';
    payload.fieldResolverMap['manifestedDate'] = 't2.awb_date';
    payload.fieldResolverMap['transactionDate'] = 't1.updated_time';
    payload.fieldResolverMap['branchIdLast'] = 't1.branch_id_last';
    payload.fieldResolverMap['awbStatusIdLast'] = 't1.awb_status_id_last';
    payload.fieldResolverMap['codPaymentMethod'] = 't8.cod_payment_method';

    payload.fieldResolverMap['awbStatusLast'] = 't7.awb_status_title';
    payload.fieldResolverMap['branchNameLast'] = 't6.branch_name';
    payload.fieldResolverMap['userIdDriver'] = 't4.user_id';
    payload.fieldResolverMap['driverName'] = 't4.first_name';
    payload.fieldResolverMap['packageTypeCode'] = 't5.package_type_code';
    payload.fieldResolverMap['transactionStatusId'] = 't1.transaction_status_id';
    payload.fieldResolverMap['transactionStatusName'] = 't9.status_title';

    // mapping search field and operator default ilike
    // payload.globalSearchFields = [
    //   {
    //     field: 'awbNumber',
    //   },
    // ];
    if (payload.sortBy === '') {
      payload.sortBy = 'transactionDate';
    }

    const repo = new OrionRepositoryService(AwbItemAttr, 't1');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['t1.awb_number', 'awbNumber'],
      ['t1.awb_item_id', 'awbItemId'],
      ['t1.updated_time', 'transactionDate'],
      ['t1.awb_status_id_last', 'awbStatusIdLast'],
      ['t7.awb_status_title', 'awbStatusLast'],
      ['t1.branch_id_last', 'branchIdLast'],
      ['t6.branch_name', 'branchNameLast'],
      ['t2.awb_date', 'manifestedDate'],
      ['t2.consignee_name', 'consigneeName'],
      ['t2.total_cod_value', 'codValue'],
      ['t6.representative_id', 'representativeId'],
      ['t4.user_id', 'userIdDriver'],
      ['t4.first_name', 'driverName'],
      ['t5.package_type_code', 'packageTypeCode'],
      ['t3.do_pod_deliver_detail_id', 'doPodDeliverDetailId'],
      [`COALESCE(t8.cod_payment_method, 'cash')`, 'codPaymentMethod'],
      ['t8.cod_payment_service', 'codPaymentService'],
      ['t8.no_reference', 'noReference'],
      ['t1.transaction_status_id', 'transactionStatusId'],
      ['t9.status_title', 'transactionStatusName'],
    );

    q.innerJoin(e => e.awb, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.doPodDeliverDetail, 't3', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(
      e => e.doPodDeliverDetail.doPodDeliver.userDriver,
      't4',
      j => j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.awb.packageType, 't5', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.branchLast, 't6', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.awbStatus, 't7', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.leftJoin(e => e.doPodDeliverDetail.codPayment, 't8', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.leftJoin(e => e.transactionStatus, 't9', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.andWhere(e => e.awb.isCod, w => w.isTrue());

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new WebAwbCodListResponseVm();

    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  static async transferBranch(
    payload: WebCodTransferPayloadVm,
  ): Promise<WebCodTransferBranchResponseVm> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    const timestamp = moment().toDate();
    let totalCodValue = 0;
    let totalAwbCash = 0;
    let totalAwbCashless = 0;
    const dataError = [];

    let totalCodValueCash = 0;
    let totalCodValueCashless = 0;
    const dataPrintCash: WebCodAwbPrintVm[] = [];
    const dataPrintCashless: WebCodAwbPrintVm[] = [];
    let printIdCash = null;
    let printIdCashless = null;

    // TODO: transction ??

    // #region data cash [optional]
    if (payload.dataCash.length) {
      const codBranchCash = new CodTransaction();
      const randomCode = await CustomCounterCode.transactionCodBranch(timestamp);
      codBranchCash.transactionCode = randomCode;
      codBranchCash.transactionDate = timestamp;
      codBranchCash.transactionStatusId = 27500; // status process;
      codBranchCash.transactionType = 'CASH';
      codBranchCash.totalCodValue = totalCodValue;
      codBranchCash.totalAwb = totalAwbCash;
      codBranchCash.branchId = permissonPayload.branchId;
      await CodTransaction.save(codBranchCash);

      const userIdDriver = payload.dataCash[0].userIdDriver;
      const metaPrint = await this.generatePrintMeta(
        codBranchCash.transactionCode,
        authMeta.displayName,
        authMeta.username,
        permissonPayload.branchId,
        userIdDriver,
      );

      for (const item of payload.dataCash) {
        const awbValid = await this.validStatusAwb(item.awbItemId);
        if (awbValid) {
          totalCodValue += Number(item.codValue);
          totalCodValueCash += Number(item.codValue);
          totalAwbCash += 1;

          // send to background process
          const dataCash = await this.handleAwbCod(
            item,
            codBranchCash.codTransactionId,
            permissonPayload.branchId,
            authMeta.userId,
          );

          dataPrintCash.push(dataCash);
        } else {
          // NOTE: error message
          const errorMessage = `status resi ${
            item.awbNumber
          } tidak valid, mohon di cek ulang!`;
          dataError.push(errorMessage);
        }
      } // end of loop data cash

      if (dataPrintCash.length) {
        // store data print cash on redis
        printIdCash = await this.printStoreData(
          metaPrint,
          codBranchCash.codTransactionId,
          dataPrintCash,
          totalCodValueCash,
          'cash',
        );

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
      }
    }
    // #endregion data cash

    // #region data cashless [optional]
    if (payload.dataCashless.length) {
      const codBranchCashless = new CodTransaction();
      const randomCode = await CustomCounterCode.transactionCodBranch(
        timestamp,
      );
      codBranchCashless.transactionCode = randomCode;
      codBranchCashless.transactionDate = timestamp;
      codBranchCashless.transactionStatusId = 27500; // status process;
      codBranchCashless.transactionType = 'CASHLESS';
      codBranchCashless.totalCodValue = totalCodValue;
      codBranchCashless.totalAwb = totalAwbCashless;
      codBranchCashless.branchId = permissonPayload.branchId;
      await CodTransaction.save(codBranchCashless);

      const userIdDriver = payload.dataCashless[0].userIdDriver;
      const metaPrint = await this.generatePrintMeta(
        codBranchCashless.transactionCode,
        authMeta.displayName,
        authMeta.username,
        permissonPayload.branchId,
        userIdDriver,
      );

      for (const item of payload.dataCashless) {
        const awbValid = await this.validStatusAwb(item.awbItemId);
        if (awbValid) {
          totalCodValue += Number(item.codValue);
          totalCodValueCashless += Number(item.codValue);
          totalAwbCashless += 1;

          const dataCashless = await this.handleAwbCod(
            item,
            codBranchCashless.codTransactionId,
            permissonPayload.branchId,
            authMeta.userId,
          );

          dataPrintCashless.push(dataCashless);
        } else {
          // NOTE: error message
          const errorMessage = `status resi ${
            item.awbNumber
          } tidak valid, mohon di cek ulang!`;
          dataError.push(errorMessage);
        }
      } // end of loop data cashless

      if (dataPrintCashless.length) {
        // store data print cashless on redis
        printIdCashless = await this.printStoreData(
          metaPrint,
          codBranchCashless.codTransactionId,
          dataPrintCashless,
          totalCodValueCashless,
          'cashless',
        );

        // update data
        await CodTransaction.update(
          {
            codTransactionId: codBranchCashless.codTransactionId,
          },
          {
            totalCodValue,
            totalAwb: totalAwbCashless,
            transactionStatusId: 35000,
          },
        );
      }
    } // end of check data cashless
    // #endregion data cashless

    // const groupPayment = groupBy(payload.data, 'paymentMethod');
    const result = new WebCodTransferBranchResponseVm();
    result.printIdCash = printIdCash;
    result.printIdCashless = printIdCashless;
    result.dataError = dataError;
    return result;
  }

  static async transactionBranch(
    payload: BaseMetaPayloadVm,
  ): Promise<WebAwbCodListTransactionResponseVm> {
    // mapping field
    payload.fieldResolverMap['transactionStatus'] = 't2.status_title';
    payload.fieldResolverMap['adminName'] = 't4.first_name';
    payload.fieldResolverMap['transactionStatusId'] = 't1.transaction_status_id';
    payload.fieldResolverMap['branchIdLast'] = 't1.branch_id';
    payload.fieldResolverMap['districtId'] = 't3.district_id';
    payload.fieldResolverMap['representativeId'] = 't3.representative_id';

    // mapping search field and operator default ilike
    // payload.globalSearchFields = [
    //   {
    //     field: 'awbNumber',
    //   },
    // ];
    if (payload.sortBy === '') {
      payload.sortBy = 'transactionDate';
    }

    const repo = new OrionRepositoryService(CodTransaction, 't1');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['t1.cod_transaction_id', 'transactionId'],
      ['t1.transaction_code', 'transactionCode'],
      ['t1.transaction_date', 'transactionDate'],
      ['t1.transaction_type', 'transactionType'],
      ['t1.transaction_status_id', 'transactionStatusId'],
      ['t2.status_title', 'transactionStatus'],
      ['t1.total_awb', 'totalAwb'],
      ['t1.total_cod_value', 'totalCodValue'],
      ['t3.branch_name', 'branchName'],
      ['t4.first_name', 'adminName'],
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

    q.andWhere(e => e.isDeleted, w => w.isFalse());

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new WebAwbCodListTransactionResponseVm();

    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  static async transactionBranchDetail(
    id: string,
  ): Promise<WebCodTransactionDetailResponseVm> {
    // awb number | method | penerima | nilai cod
    const qb = createQueryBuilder();
    qb.addSelect('t1.awb_number', 'awbNumber');
    qb.addSelect('t1.payment_method', 'paymentMethod');
    qb.addSelect('t1.consignee_name', 'consigneeName');
    qb.addSelect('t1.cod_value', 'codValue');

    qb.from('cod_transaction_detail', 't1');
    qb.where('t1.cod_transaction_id = :id', { id });
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

  static async transferHeadOffice(
    payload: WebCodTransferHeadOfficePayloadVm,
    file,
  ): Promise<WebCodTransferHeadOfficeResponseVm> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    const timestamp = moment().toDate();
    let attachmentId = null;
    // upload file to aws s3
    if (file) {
      const attachment = await AttachmentService.uploadFileBufferToS3(
        file.buffer,
        file.originalname,
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

    const dataError = [];
    const randomCode = await CustomCounterCode.bankStatement(
      timestamp,
    );
    const bankAccount = await this.getBankAccount(payload.bankBranchId);
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
        bankStatement.transactionStatusId = 35000;
        bankStatement.totalCodValue = totalValue; // init
        bankStatement.totalTransaction = totalData; // init
        bankStatement.totalAwb = totalAwb; // init
        bankStatement.bankBranchId = payload.bankBranchId;
        bankStatement.bankAccount = bankAccount;
        bankStatement.attachmentId = attachmentId;
        bankStatement.branchId = permissonPayload.branchId;
        await transactionManager.save(CodBankStatement, bankStatement);

        // looping data transaction and update status and bank statement id [create new table] ??
        for (const transactionId of payload.dataTransactionId) {
          const codBranch = await CodTransaction.findOne({
            where: {
              codTransactionId: transactionId,
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
            // TODO: update transaction detail and history [35000]
            // codTransactionId
          } else {
            dataError.push(`Transaction Id ${transactionId}, tidak valid!`);
          }
        } // endof loop

        // update data bank statment
        await transactionManager.update(
          CodBankStatement,
          {
            codBankStatementId: bankStatement.codBankStatementId,
          },
          {
            totalCodValue: totalValue,
            totalTransaction: totalData,
            totalAwb,
            updatedTime: timestamp,
            userIdUpdated: authMeta.userId,
          },
        );
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
      't1.user_id_created = t4.user_id AND t4.is_deleted = false',
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
    payload.fieldResolverMap['transactionStatusId'] = 't1.transaction_status_id';
    payload.fieldResolverMap['branchIdLast'] = 't1.branch_id';
    payload.fieldResolverMap['districtId'] = 't3.district_id';
    payload.fieldResolverMap['representativeId'] = 't3.representative_id';

    // mapping search field and operator default ilike
    // payload.globalSearchFields = [
    //   {
    //     field: 'awbNumber',
    //   },
    // ];
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
      ['t1.transaction_status_id', 'transactionStatusId'],
      ['t1.bank_account', 'bankAccount'],
      ['t2.status_title', 'transactionStatus'],
      ['t1.total_transaction', 'totalTransaction'],
      ['t1.total_awb', 'totalAwb'],
      ['t1.total_cod_value', 'totalCodValue'],
      ['t1.validate_datetime', 'validateDatetime'],
      ['t1.cancel_datetime', 'cancelDatetime'],
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
    q.innerJoin(e => e.attachment, 't5', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.andWhere(e => e.isDeleted, w => w.isFalse());

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
            bankNoReference: payload.bankNoReference,
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

            // TODO: add transaction history [40000]
            // codTransactionId
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

        // update transaction branch
        await transactionManager.update(
          CodTransaction,
          {
            codBankStatementId: payload.bankStatementId,
          },
          {
            transactionStatusId: 32500,
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
            // codTransactionId
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

  // func private ==============================================================
  private static async handleAwbCod(
    item: WebCodAwbPayloadVm,
    transctiontId: string,
    branchId: number,
    userId: number,
  ): Promise<WebCodAwbPrintVm> {

    // update awb_item_attr transaction status 3100
    await AwbItemAttr.update(
      { awbItemId: item.awbItemId },
      {
        transactionStatusId: TRANSACTION_STATUS.TRM,
      },
    );

    // #region send to background process with bull
    const firstTransaction = new WebCodFirstTransactionPayloadVm();
    firstTransaction.awbItemId = item.awbItemId;
    firstTransaction.awbNumber = item.awbNumber;
    firstTransaction.codTransactionId = transctiontId;
    firstTransaction.transactionStatusId = 31000;
    firstTransaction.supplierInvoiceStatusId = null;
    firstTransaction.codSupplierInvoiceId = null;
    firstTransaction.paymentMethod = item.paymentMethod;
    firstTransaction.paymentService = item.paymentService;
    firstTransaction.noReference = item.noReference;
    firstTransaction.branchId = branchId;
    firstTransaction.userId = userId;
    firstTransaction.userIdDriver = item.userIdDriver;
    CodFirstTransactionQueueService.perform(firstTransaction, moment().toDate());
    // #endregion send to background

    // response
    const result = new WebCodAwbPrintVm();
    result.awbNumber = item.awbNumber;
    result.codValue = item.codValue;
    result.provider = item.paymentService;
    return result;
  }

  private static async validStatusAwb(awbItemId: number): Promise<boolean> {
    // check awb status mush valid dlv
    const awbValid = await AwbItemAttr.findOne({
      select: ['awbItemAttrId', 'awbItemId', 'awbStatusIdLast'],
      where: {
        awbItemId,
        awbStatusIdLast: AWB_STATUS.DLV,
        isDeleted: false,
      },
    });
    if (awbValid) {
      return true;
    } else {
      return false;
    }
  }

  // handle data store for printing
  private static async generatePrintMeta(
    transactionCode: string,
    adminName: string,
    nikAdmin: string,
    branchId: number,
    userIdDriver: number,
  ): Promise<WebCodPrintMetaVm> {
    const timestamp = moment();
    const result = new WebCodPrintMetaVm();

    result.transactionCode = transactionCode;
    result.transactionDate = timestamp.format('DD/MM/YY');
    result.transactionTime = timestamp.format('HH:mm');
    result.adminName = adminName;
    result.nikAdmin = nikAdmin;

    const branch = await Branch.findOne({
      select: ['branchId', 'branchName'],
      where: {
        branchId,
        isActive: true,
        isDeleted: false,
      },
    });

    if (!branch) {
      throw new BadRequestException('Gerai tidak ditemukan!');
    }

    const user = await User.findOne({
      select: ['userId', 'employeeId', 'firstName', 'username'],
      where: {
        userId: userIdDriver,
        isDeleted: false,
      },
    });

    if (!user) {
      throw new BadRequestException('User tidak ditemukan!');
    }
    // for data print store
    result.branchName = branch.branchName;
    result.driverName = user.firstName;
    result.nikDriver = user.username;
    return result;
  }

  private static async printStoreData(
    metaPrint: WebCodPrintMetaVm,
    codTransactionId: string,
    data: WebCodAwbPrintVm[],
    totalValue: number,
    type: string,
  ): Promise<string> {
    metaPrint.totalCodValue = totalValue;
    metaPrint.totalItems = data.length;
    const storePrint = new PrintCodTransferBranchVm();

    storePrint.meta = metaPrint;
    storePrint.data = data;
    // store redis
    const printId = `${codTransactionId}--${type}`;
    await PrintByStoreService.storeGenericPrintData(
      'cod-transfer-branch',
      printId,
      storePrint,
    );
    return printId;
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
