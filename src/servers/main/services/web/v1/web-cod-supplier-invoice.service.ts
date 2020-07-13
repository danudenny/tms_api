// #region import
import { Not, getManager, IsNull, createQueryBuilder } from 'typeorm';
import { BadRequestException, ServiceUnavailableException } from '@nestjs/common';

import { BaseMetaPayloadVm } from '../../../../../shared/models/base-meta-payload.vm';
import {
    CodTransactionDetail,
} from '../../../../../shared/orm-entity/cod-transaction-detail';
import { AuthService } from '../../../../../shared/services/auth.service';
import { MetaService } from '../../../../../shared/services/meta.service';
import { OrionRepositoryService } from '../../../../../shared/services/orion-repository.service';
import { WebCodInvoiceValidatePayloadVm, WebCodInvoiceDraftPayloadVm, WebCodInvoiceAddAwbPayloadVm, WebCodInvoiceRemoveAwbPayloadVm, WebCodFirstTransactionPayloadVm } from '../../../models/cod/web-awb-cod-payload.vm';
import {
    WebAwbCodDetailPartnerResponseVm, WebAwbCodSupplierInvoiceResponseVm,
    WebCodSupplierInvoicePaidResponseVm,
    WebCodInvoiceValidateResponseVm,
    WebAwbCodInvoiceResponseVm,
    WebCodInvoiceDraftResponseVm,
    WebCodListInvoiceResponseVm,
    WebCodInvoiceAddResponseVm,
    WebCodAwbDelivery,
} from '../../../models/cod/web-awb-cod-response.vm';

import moment = require('moment');
import { CodSupplierInvoice } from '../../../../../shared/orm-entity/cod-supplier-invoice';
import { CustomCounterCode } from '../../../../../shared/services/custom-counter-code.service';
import { AwbItemAttr } from '../../../../../shared/orm-entity/awb-item-attr';
import { AWB_STATUS } from '../../../../../shared/constants/awb-status.constant';
import { CodFirstTransactionQueueService } from '../../../../queue/services/cod/cod-first-transaction-queue.service';
import { DoPodDeliverDetail } from '../../../../../shared/orm-entity/do-pod-deliver-detail';
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
    q.andWhere(e => e.isDeleted, w => w.isFalse());

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new WebAwbCodDetailPartnerResponseVm();

    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  static async supplierInvoiceValidate(
    payload: WebCodInvoiceValidatePayloadVm,
  ): Promise<WebCodInvoiceValidateResponseVm> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    const timestamp = moment().toDate();

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
          },
          {
            codSupplierInvoiceId: supplierInvoice.codSupplierInvoiceId,
            supplierInvoiceStatusId: 41000,
            userIdUpdated: authMeta.userId,
            updatedTime: timestamp,
          },
        );

        // TODO: transaction history [41000]
        // codSupplierInvoiceId
      });
      const result = new WebCodInvoiceValidateResponseVm();
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

    // NOTE: set filter
    q.andWhere(e => e.supplierInvoiceStatusId, w => w.equals(41000));
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
            updatedTime: timestamp,
          },
        );

        // update data transaction detail, add FK supplier invoice id
        await transactionManager.update(
          CodTransactionDetail,
          {
            codSupplierInvoiceId: supplierInvoice.codSupplierInvoiceId,
            transactionStatusId: 41000,
          },
          {
            supplierInvoiceStatusId: 45000,
            userIdUpdated: authMeta.userId,
            updatedTime: timestamp,
          },
        );

        // TODO: transaction history [45000]
        // codSupplierInvoiceId
      });
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
  ) {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    const timestamp = moment().toDate();
    const dataError = [];
    // TODO: loop payload
    for (const awbNumber of payload.awbNumber) {
      let errorMessage = null;
      // awb item attr find by awb number
      // check transaction status id
      const transactionDetail = await CodTransactionDetail.findOne({
        where: {
          awbNumber,
          isDeleted: false,
        },
      });
      if (transactionDetail) {
        if (transactionDetail.supplierInvoiceStatusId) {
          errorMessage = `Resi ${awbNumber} tidak valid, sudah di proses!`;
        } else {
          // check transaction status id
          // transactionDetail.transactionStatusId;
        }
      } else {
        // get data awb item attr
        const awbItem = await this.getAwbDelivery(awbNumber);

        if (awbItem) {
          // TODO: process
          // #region send to background process with bull
          const firstTransaction = new WebCodFirstTransactionPayloadVm();
          // firstTransaction.awbItemId = item.awbItemId;
          // firstTransaction.awbNumber = item.awbNumber;
          // firstTransaction.codTransactionId = null;
          // firstTransaction.transactionStatusId = 30000;
          // firstTransaction.supplierInvoiceStatusId = 41000;
          // firstTransaction.codSupplierInvoiceId = payload.supplierInvoiceId;
          // firstTransaction.paymentMethod = item.paymentMethod;
          // firstTransaction.paymentService = item.paymentService;
          // firstTransaction.noReference = item.noReference;
          // firstTransaction.branchId = permissonPayload.branchId;
          // firstTransaction.userId = authMeta.userId;
          // firstTransaction.userIdDriver = item.userIdDriver;
          CodFirstTransactionQueueService.perform(
            firstTransaction,
            moment().toDate(),
          );
          // #endregion send to background
        } else {
          errorMessage = `Resi ${awbNumber} tidak valid, status belum Delivery!`;
        }
      }

      // NOTE: error message
      if (errorMessage) { dataError.push(errorMessage); }
    } // end of loop

    const result = new WebCodInvoiceAddResponseVm();
    return null;
  }

  static async supplierInvoiceRemove(payload: WebCodInvoiceRemoveAwbPayloadVm) {
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

    // NOTE: set filter
    // q.andWhere(e => e.supplierInvoiceStatusId, w => w.equals(41000));
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

  private static async getAwbDelivery(awbNumber: string): Promise<WebCodAwbDelivery> {
    const qb = createQueryBuilder();
    qb.addSelect('t1.awb_number', 'awbNumber');
    qb.addSelect('t1.awb_item_id', 'awbItemId');
    qb.addSelect('t2.user_id_driver', 'userIdDriver');
    qb.addSelect('t2.branch_id', 'branchIdAssign');
    qb.addSelect(
      `COALESCE(t3.cod_payment_method, 'cash')`,
      'codPaymentMethod',
    );
    qb.addSelect('t3.cod_payment_service', 'codPaymentService');
    qb.addSelect('t3.no_reference', 'noReference');

    qb.from('do_pod_deliver_detail', 't1');
    qb.innerJoin(
      'do_pod_deliver',
      't2',
      't1.do_pod_deliver_id = t2.do_pod_deliver_id AND t2.is_deleted = false',
    );
    qb.leftJoin(
      'cod_payment',
      't3',
      't1.do_pod_deliver_detail_id = t3.do_pod_deliver_detail_id AND t3.is_deleted = false',
    );
    qb.where(
      't1.awb_number = :awbNumber AND t1.awb_status_id_last = :awbStatus',
      { awbNumber, awbStatus: AWB_STATUS.DLV },
    );
    qb.andWhere('t1.is_deleted = false');
    return await qb.getRawOne();
  }
}
