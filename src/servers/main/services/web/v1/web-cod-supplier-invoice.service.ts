// #region import
import { getManager, IsNull, createQueryBuilder } from 'typeorm';
import { BadRequestException, ServiceUnavailableException } from '@nestjs/common';

import { BaseMetaPayloadVm } from '../../../../../shared/models/base-meta-payload.vm';
import {
    CodTransactionDetail,
} from '../../../../../shared/orm-entity/cod-transaction-detail';
import { AuthService } from '../../../../../shared/services/auth.service';
import { MetaService } from '../../../../../shared/services/meta.service';
import { OrionRepositoryService } from '../../../../../shared/services/orion-repository.service';
import { WebCodInvoiceDraftPayloadVm, WebCodInvoiceAddAwbPayloadVm, WebCodInvoiceRemoveAwbPayloadVm, WebCodInvoiceCreatePayloadVm, WebCodFirstTransactionPayloadVm } from '../../../models/cod/web-awb-cod-payload.vm';
import {
    WebAwbCodDetailPartnerResponseVm, WebAwbCodSupplierInvoiceResponseVm,
    WebCodSupplierInvoicePaidResponseVm,
    WebAwbCodInvoiceResponseVm,
    WebCodInvoiceDraftResponseVm,
    WebCodListInvoiceResponseVm,
    WebCodInvoiceAddResponseVm,
    WebCodAwbDelivery,
    WebCodInvoiceRemoveResponseVm,
    WebCodInvoiceCreateResponseVm,
} from '../../../models/cod/web-awb-cod-response.vm';

import moment = require('moment');
import { CodSupplierInvoice } from '../../../../../shared/orm-entity/cod-supplier-invoice';
import { CustomCounterCode } from '../../../../../shared/services/custom-counter-code.service';
import { TRANSACTION_STATUS } from '../../../../../shared/constants/transaction-status.constant';
import { CodUpdateSupplierInvoiceQueueService } from '../../../../queue/services/cod/cod-update-supplier-invoice-queue.service';
import { CodTransactionHistoryQueueService } from '../../../../queue/services/cod/cod-transaction-history-queue.service';
import { RedisService } from '../../../../../shared/services/redis.service';
import { CodFirstTransactionQueueService } from '../../../../queue/services/cod/cod-first-transaction-queue.service';
// #endregion import

export class V1WebCodSupplierInvoiceService {

  static async supplierInvoice(
    payload: BaseMetaPayloadVm,
  ): Promise<WebAwbCodSupplierInvoiceResponseVm> {
    // mapping field
    payload.fieldResolverMap['partnerName'] = 't2.partner_name';
    payload.fieldResolverMap['partnerId'] = 't2.partner_id';

    payload.fieldResolverMap['totalCodValue'] = 'totalCodValue';
    payload.fieldResolverMap['totalAwb'] = 'totalAwb';

    if (payload.sortBy === '') {
      payload.sortBy = 'partnerName';
    }

    const repo = new OrionRepositoryService(CodTransactionDetail, 't1');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['t2.partner_id', 'partnerId'],
      ['t2.partner_name', 'partnerName'],
      ['SUM(t1.cod_value)', 'totalCodValue'],
      ['COUNT(t1.partner_id)', 'totalAwb'],
    );

    q.innerJoin(e => e.partner, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    // NOTE: set filter
    q.andWhere(e => e.transactionStatusId, w => w.equals(40000));
    q.andWhere(e => e.codSupplierInvoiceId, w => w.isNull());
    q.andWhere(e => e.isVoid, w => w.isFalse());
    q.andWhere(e => e.isDeleted, w => w.isFalse());
    q.groupByRaw('t2.partner_id');

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new WebAwbCodSupplierInvoiceResponseVm();

    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  static async awbDetailByPartnerId(
    payload: BaseMetaPayloadVm,
  ): Promise<WebAwbCodDetailPartnerResponseVm> {

    const repo = new OrionRepositoryService(
      CodTransactionDetail,
      't1',
    );
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['t1.partner_id', 'partnerId'],
      ['t1.awb_number', 'awbNumber'],
      ['t1.payment_method', 'paymentMethod'],
      ['t1.consignee_name', 'consigneeName'],
      ['t1.cod_value', 'codValue'],
    );

    // NOTE: set filter
    q.andWhere(e => e.transactionStatusId, w => w.equals(40000));
    q.andWhere(e => e.codSupplierInvoiceId, w => w.isNull());
    q.andWhere(e => e.isVoid, w => w.isFalse());
    q.andWhere(e => e.isDeleted, w => w.isFalse());

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new WebAwbCodDetailPartnerResponseVm();

    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  static async supplierInvoiceCreate(
    payload: WebCodInvoiceCreatePayloadVm,
  ): Promise<WebCodInvoiceCreateResponseVm> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    const timestamp = moment().toDate();
    // handle race condition
    const redlock = await RedisService.redlock(
      `redlock:supplierInvoiceCreate:${payload.partnerId}`,
    );

    if (!redlock) {
      throw new BadRequestException('Data Supplier Invoice Sedang di proses!');
    }

    try {
      // NOTE: generate supplier invoice by partnerid
      // create data supplier invoice with status draft
      const supplierInvoice = new CodSupplierInvoice();
      const randomCode = await CustomCounterCode.supplierInvoiceCod(timestamp);
      supplierInvoice.supplierInvoiceCode = randomCode;
      supplierInvoice.supplierInvoiceDate = timestamp;
      supplierInvoice.supplierInvoiceStatusId = 41000; // status DRAFT
      supplierInvoice.branchId = permissonPayload.branchId;
      supplierInvoice.partnerId = payload.partnerId;
      await CodSupplierInvoice.save(supplierInvoice);

      await getManager().transaction(async transactionManager => {
        // update data transaction detail, add FK supplier invoice id
        await transactionManager.update(
          CodTransactionDetail,
          {
            partnerId: payload.partnerId,
            transactionStatusId: 40000,
            codSupplierInvoiceId: IsNull(),
            isVoid: false,
          },
          {
            codSupplierInvoiceId: supplierInvoice.codSupplierInvoiceId,
            supplierInvoiceStatusId: 41000,
            userIdUpdated: authMeta.userId,
            updatedTime: timestamp,
          },
        );
      });
      // NOTE: transaction history [41000]
      CodUpdateSupplierInvoiceQueueService.perform(
        payload.partnerId,
        supplierInvoice.codSupplierInvoiceId,
        41000,
        permissonPayload.branchId,
        authMeta.userId,
        timestamp,
      );
      const result = new WebCodInvoiceCreateResponseVm();
      result.supplierInvoiceId = supplierInvoice.codSupplierInvoiceId;
      result.supplierInvoiceCode = supplierInvoice.supplierInvoiceCode;
      result.supplierInvoiceDate = supplierInvoice.supplierInvoiceDate.toDateString();
      result.status = 'ok';
      result.message = 'success';
      return result;
    } catch (error) {
      throw new ServiceUnavailableException(error.message);
    }
  }

  static async supplierInvoiceDraft(
    payload: WebCodInvoiceDraftPayloadVm,
  ): Promise<WebCodInvoiceDraftResponseVm> {
    // get data supplier invoice
    const supplierInvoice = await this.getSupplierInvoice(payload.supplierInvoiceId);
    if (supplierInvoice) {
      return supplierInvoice;
    } else {
      throw new BadRequestException('Data Supplier Invoice tidak ditemukan!');
    }
  }

  static async awbDetailByInvoiceId(
    payload: BaseMetaPayloadVm,
  ): Promise<WebAwbCodInvoiceResponseVm> {
    // mapping field
    payload.fieldResolverMap['supplierInvoiceId'] = 't1.cod_supplier_invoice_id';
    payload.fieldResolverMap['transactionStatusId'] = 't1.transaction_status_id';
    payload.fieldResolverMap['weight'] = 't1.weight_rounded';
    payload.fieldResolverMap['transactionStatusName'] = 't2.status_title';

    const repo = new OrionRepositoryService(CodTransactionDetail, 't1');
    const q = repo.findAllRaw();
    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['t1.awb_item_id', 'awbItemId'],
      ['t1.awb_number', 'awbNumber'],
      ['t1.awb_date', 'awbDate'],
      ['t1.package_type_code', 'packageTypeCode'],
      ['t1.consignee_name', 'consigneeName'],
      ['t1.destination', 'destination'],
      ['t1.cod_value', 'codValue'],
      ['t1.weight_rounded', 'weight'],
      ['t1.transaction_status_id', 'transactionStatusId'],
      ['t2.status_title', 'transactionStatusName'],
    );

    q.innerJoin(e => e.transactionStatus, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.andWhere(e => e.isDeleted, w => w.isFalse());

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new WebAwbCodInvoiceResponseVm();
    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);
    return result;
  }

  static async supplierInvoicePaid(
    payload: WebCodInvoiceDraftPayloadVm,
  ): Promise<WebCodSupplierInvoicePaidResponseVm> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    const timestamp = moment().toDate();

    const supplierInvoice = await CodSupplierInvoice.findOne({
      where: {
        codSupplierInvoiceId: payload.supplierInvoiceId,
        supplierInvoiceStatusId: 41000,
        isDeleted: false,
      },
    });
    if (!supplierInvoice) {
      throw new BadRequestException('Supplier Invoice tidak valid/sudah di proses!');
    }

    // check Total data
    try {
      await getManager().transaction(async transactionManager => {
        await transactionManager.update(
          CodSupplierInvoice,
          {
            codSupplierInvoiceId: supplierInvoice.codSupplierInvoiceId,
          },
          {
            supplierInvoiceStatusId: 45000,
            userIdUpdated: authMeta.userId,
            paidDatetime: timestamp,
            updatedTime: timestamp,
          },
        );

        // update data transaction detail, add FK supplier invoice id
        await transactionManager.update(
          CodTransactionDetail,
          {
            codSupplierInvoiceId: supplierInvoice.codSupplierInvoiceId,
            supplierInvoiceStatusId: 41000,
          },
          {
            supplierInvoiceStatusId: 45000,
            userIdUpdated: authMeta.userId,
            updatedTime: timestamp,
          },
        );

        // NOTE: transaction history [45000]
        CodUpdateSupplierInvoiceQueueService.perform(
          supplierInvoice.partnerId,
          supplierInvoice.codSupplierInvoiceId,
          45000,
          permissonPayload.branchId,
          authMeta.userId,
          timestamp,
        );
      }); // end transaction

      // response
      const result = new WebCodSupplierInvoicePaidResponseVm();
      result.status = 'ok';
      result.message = 'success';
      return result;

    } catch (error) {
      throw new ServiceUnavailableException(error.message);
    }
  }

  static async supplierInvoiceAdd(
    payload: WebCodInvoiceAddAwbPayloadVm,
  ): Promise<WebCodInvoiceAddResponseVm> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    const timestamp = moment().toDate();
    const dataError = [];
    let totalSuccess = 0;
    let totalCodValue = 0;
    // NOTE: loop payload
    for (const awbNumber of payload.awbNumber) {
      let errorMessage = null;
      // handle race condition
      const redlock = await RedisService.redlock(`redlock:invoiceAddAwb:${awbNumber}`);
      if (redlock) {
        // check transaction status id
        const transactionDetail = await CodTransactionDetail.findOne({
          where: {
            awbNumber,
            partnerId: payload.partnerId,
            isDeleted: false,
          },
        });
        if (transactionDetail) {
          if (transactionDetail.supplierInvoiceStatusId) {
            errorMessage = `Resi ${awbNumber} tidak valid, sudah di proses!`;
          } else {
            // check is void awb
            if (transactionDetail.isVoid == true) {
              errorMessage = `Resi ${awbNumber} tidak valid, sudah di void!`;
            } else {
              // update data transaction detail
              await CodTransactionDetail.update(
                {
                  codTransactionDetailId: transactionDetail.codTransactionDetailId,
                },
                {
                  codSupplierInvoiceId: payload.supplierInvoiceId,
                  supplierInvoiceStatusId: TRANSACTION_STATUS.DRAFT_INV,
                  userIdUpdated: authMeta.userId,
                  updatedTime: timestamp,
                },
              );
              // NOTE: update transaction history for supplier invoice??
              CodTransactionHistoryQueueService.perform(
                transactionDetail.awbItemId,
                transactionDetail.awbNumber,
                TRANSACTION_STATUS.DRAFT_INV,
                permissonPayload.branchId,
                authMeta.userId,
                timestamp,
              );
              totalSuccess += 1;
              totalCodValue += Number(transactionDetail.codValue);
            } // end is void
          }
        } else {
          // get data awb item attr
          const awbItem = await this.dataTransaction(
            awbNumber,
            payload.partnerId,
          );
          if (awbItem) {
            // NOTE: Process Transaction Detail on background
            this.createTransactionDetail(
              awbItem,
              payload.supplierInvoiceId,
              authMeta.userId,
              permissonPayload.branchId,
            );

            totalSuccess += 1;
            totalCodValue += Number(awbItem.codValue);
          } else {
            errorMessage = `Resi ${awbNumber} tidak valid, status belum DLV / milik partner lain!`;
          }
        }
      } else {
        errorMessage = `resi ${awbNumber} sedang d proses!!`;
      }

      // NOTE: error message
      if (errorMessage) { dataError.push(errorMessage); }
    } // end of loop

    const result = new WebCodInvoiceAddResponseVm();
    result.status = 'ok';
    result.message = 'success';
    result.totalSuccess = totalSuccess;
    result.totalCodValue = totalCodValue;
    result.dataError = dataError;
    return result;
  }

  static async supplierInvoiceRemove(
    payload: WebCodInvoiceRemoveAwbPayloadVm,
  ): Promise<WebCodInvoiceRemoveResponseVm> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    const timestamp = moment().toDate();
    const dataError = [];
    let totalSuccess = 0;
        // NOTE: loop payload
    for (const awbNumber of payload.awbNumber) {
      let errorMessage = null;
      const transactionDetail = await CodTransactionDetail.findOne({
        where: {
          awbNumber,
          codSupplierInvoiceId: payload.supplierInvoiceId,
          isDeleted: false,
        },
      });
      if (transactionDetail) {
        await CodTransactionDetail.update({
          codTransactionDetailId: transactionDetail.codTransactionDetailId,
        }, {
          supplierInvoiceStatusId: null,
          codSupplierInvoiceId: null,
          userIdUpdated: authMeta.userId,
          updatedTime: timestamp,
        });
        // NOTE: update transaction history for supplier invoice??
        CodTransactionHistoryQueueService.perform(
          transactionDetail.awbItemId,
          transactionDetail.awbNumber,
          TRANSACTION_STATUS.CANCEL_DRAFT,
          permissonPayload.branchId,
          authMeta.userId,
          timestamp,
          true,
        );
        totalSuccess += 1;
      } else {
        errorMessage = `Resi ${awbNumber} tidak valid, tidak ditemukan dalam transaksi!`;
      }

      // NOTE: error message
      if (errorMessage) { dataError.push(errorMessage); }
    } // end of loop
    const result = new WebCodInvoiceRemoveResponseVm();
    result.status = 'ok';
    result.message = 'success';
    result.totalSuccess = totalSuccess;
    result.dataError = dataError;
    return result;
  }

  static async supplierInvoiceVoid(
    payload: WebCodInvoiceRemoveAwbPayloadVm,
  ): Promise<WebCodInvoiceRemoveResponseVm> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    const timestamp = moment().toDate();
    const dataError = [];
    let totalSuccess = 0;
    // NOTE: loop payload
    for (const awbNumber of payload.awbNumber) {
      const transactionDetail = await CodTransactionDetail.findOne({
        where: {
          awbNumber,
          codSupplierInvoiceId: payload.supplierInvoiceId,
          isVoid: false,
          isDeleted: false,
        },
      });

      if (transactionDetail) {
        await CodTransactionDetail.update({
          codTransactionDetailId: transactionDetail.codTransactionDetailId,
        }, {
          supplierInvoiceStatusId: null,
          codSupplierInvoiceId: null,
          voidNote: payload.voidNote,
          isVoid: true,
          userIdUpdated: authMeta.userId,
          updatedTime: timestamp,
        });
        // NOTE: update transaction history for supplier invoice??
        CodTransactionHistoryQueueService.perform(
          transactionDetail.awbItemId,
          transactionDetail.awbNumber,
          TRANSACTION_STATUS.VOID,
          permissonPayload.branchId,
          authMeta.userId,
          timestamp,
          true,
        );
        totalSuccess += 1;
      } else {
        const errorMessage = `Resi ${awbNumber} tidak valid, sudah pernah void resi!`;
        dataError.push(errorMessage);
      }

    } // end of loop
    const result = new WebCodInvoiceRemoveResponseVm();
    result.status = 'ok';
    result.message = 'success';
    result.totalSuccess = totalSuccess;
    result.dataError = dataError;
    return result;
  }

  static async listInvoice(
    payload: BaseMetaPayloadVm,
  ): Promise<WebCodListInvoiceResponseVm> {
    // mapping field
    payload.fieldResolverMap['supplierInvoiceStatus'] = 't2.status_title';
    payload.fieldResolverMap['adminName'] = 't5.first_name';
    payload.fieldResolverMap['supplierInvoiceStatusId'] = 't1.supplier_invoice_status_id';
    payload.fieldResolverMap['partnerId'] = 't1.partner_id';
    payload.fieldResolverMap['partnerName'] = 't4.partner_name';

    const repo = new OrionRepositoryService(CodSupplierInvoice, 't1');
    const q = repo.findAllRaw();
    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['t4.partner_name', 'partnerName'],
      ['t1.cod_supplier_invoice_id', 'supplierInvoiceId'],
      ['t1.supplier_invoice_code', 'supplierInvoiceCode'],
      ['t1.supplier_invoice_date', 'supplierInvoiceDate'],
      ['t1.supplier_invoice_status_id', 'supplierInvoiceStatusId'],
      ['t1.paid_datetime', 'paidDatetime'],
      ['COUNT(t3.cod_supplier_invoice_id)', 'totalAwb'],
      ['SUM(t3.cod_value)', 'totalCodValue'],
      ['t2.status_title', 'supplierInvoiceStatus'],
      ['t5.first_name', 'adminName'],
    );

    q.innerJoin(e => e.transactionStatus, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.details, 't3', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.partner, 't4', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.userAdmin, 't5', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.andWhere(e => e.isDeleted, w => w.isFalse());
    q.groupByRaw(
      't1.cod_supplier_invoice_id, t2.transaction_status_id, t4.partner_id, t5.user_id',
    );
    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new WebCodListInvoiceResponseVm();
    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  // private =======================================================
  private static async getSupplierInvoice(
    supplierInvoiceId: string,
  ): Promise<WebCodInvoiceDraftResponseVm> {
    const qb = createQueryBuilder();
    qb.addSelect('t2.partner_id', 'partnerId');
    qb.addSelect('t2.partner_name', 'partnerName');
    qb.addSelect('t1.supplier_invoice_code', 'supplierInvoiceCode');
    qb.addSelect('t1.supplier_invoice_date', 'supplierInvoiceDate');
    qb.addSelect('COUNT(t3.cod_supplier_invoice_id)', 'totalAwb');
    qb.addSelect('SUM(t3.cod_value)', 'totalCodValue');
    qb.from('cod_supplier_invoice', 't1');
    qb.innerJoin(
      'partner',
      't2',
      't1.partner_id = t2.partner_id AND t2.is_deleted = false',
    );
    qb.innerJoin(
      'cod_transaction_detail',
      't3',
      't1.cod_supplier_invoice_id = t3.cod_supplier_invoice_id AND t3.is_deleted = false',
    );
    qb.where('t1.cod_supplier_invoice_id = :supplierInvoiceId', {
      supplierInvoiceId,
    });
    qb.andWhere('t1.is_deleted = false');
    qb.groupBy('t1.cod_supplier_invoice_id, t2.partner_id');

    return await qb.getRawOne();
  }

  private static async dataTransaction(
    awbNumber: string,
    partnerId: number,
  ): Promise<WebCodAwbDelivery> {

    // #region get data query builder
    const qb = createQueryBuilder();
    qb.addSelect('t1.awb_item_id', 'awbItemId');
    qb.addSelect('t1.awb_number', 'awbNumber');
    qb.addSelect('t3.cod_value', 'codValue');
    qb.addSelect('t6.user_id_driver', 'userIdDriver');
    qb.addSelect('t7.cod_payment_method', 'paymentMethod');
    qb.addSelect('t7.cod_payment_service', 'paymentService');
    qb.addSelect('t7.no_reference', 'noReference');

    qb.from('awb_item_attr', 't1');
    qb.innerJoin(
      'awb',
      't2',
      't1.awb_id = t2.awb_id AND t2.is_cod = true AND t2.is_deleted = false',
    );
    qb.innerJoin(
      'pickup_request_detail',
      't3',
      't1.awb_item_id = t3.awb_item_id AND t3.is_deleted = false',
    );
    qb.innerJoin(
      'pickup_request',
      't4',
      't3.pickup_request_id = t4.pickup_request_id AND t4.is_deleted = false',
    );
    qb.innerJoin(
      'do_pod_deliver_detail',
      't5',
      't5.awb_item_id = t1.awb_item_id AND t5.awb_status_id_last = 30000 AND t5.is_deleted = false',
    );
    qb.innerJoin(
      'do_pod_deliver',
      't6',
      't6.do_pod_deliver_id = t5.do_pod_deliver_id AND t6.is_deleted = false',
    );
    qb.innerJoin(
      'cod_payment',
      't7',
      't7.do_pod_deliver_detail_id = t5.do_pod_deliver_detail_id AND t7.is_deleted = false',
    );
    qb.where('t1.awb_number = :awbNumber', { awbNumber });
    qb.andWhere('t1.is_deleted = false');
    qb.andWhere('t4.partner_id = :partnerId', { partnerId });
    // #endregion query

    return await qb.getRawOne();
  }

  private static createTransactionDetail(
    item: WebCodAwbDelivery,
    codSupplierInvoiceId: string,
    userId: number,
    branchId: number,
  ): boolean {
    // #region send to background process with bull
    const firstTransaction = new WebCodFirstTransactionPayloadVm();
    firstTransaction.awbItemId = item.awbItemId;
    firstTransaction.awbNumber = item.awbNumber;
    firstTransaction.codTransactionId = null;
    firstTransaction.transactionStatusId = 30000;
    firstTransaction.supplierInvoiceStatusId = TRANSACTION_STATUS.DRAFT_INV;
    firstTransaction.codSupplierInvoiceId = codSupplierInvoiceId;
    firstTransaction.paymentMethod = item.paymentMethod;
    firstTransaction.paymentService = item.paymentService;
    firstTransaction.noReference = item.noReference;
    firstTransaction.branchId = branchId;
    firstTransaction.userId = userId;
    firstTransaction.userIdDriver = item.userIdDriver;
    CodFirstTransactionQueueService.perform(
      firstTransaction,
      moment().toDate(),
    );
    // #endregion send to background
    return true;
  }
}
