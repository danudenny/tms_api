import { Not, getManager, IsNull, createQueryBuilder } from 'typeorm';
import { BadRequestException, ServiceUnavailableException } from '@nestjs/common';

import { BaseMetaPayloadVm } from '../../../../../shared/models/base-meta-payload.vm';
import {
    CodTransactionDetail,
} from '../../../../../shared/orm-entity/cod-transaction-detail';
import { AuthService } from '../../../../../shared/services/auth.service';
import { MetaService } from '../../../../../shared/services/meta.service';
import { OrionRepositoryService } from '../../../../../shared/services/orion-repository.service';
import { WebCodSupplierInvoicePayloadVm, WebCodInvoiceValidatePayloadVm, WebCodInvoiceDraftPayloadVm } from '../../../models/cod/web-awb-cod-payload.vm';
import {
    WebAwbCodDetailPartnerResponseVm, WebAwbCodSupplierInvoiceResponseVm,
    WebCodSupplierInvoicePaidResponseVm,
    WebCodInvoiceValidateResponseVm,
    WebAwbCodInvoiceResponseVm,
    WebCodInvoiceDraftResponseVm,
    WebCodListInvoiceResponseVm,
} from '../../../models/cod/web-awb-cod-response.vm';

import moment = require('moment');
import { CodSupplierInvoice } from '../../../../../shared/orm-entity/cod-supplier-invoice';
import { CustomCounterCode } from '../../../../../shared/services/custom-counter-code.service';

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
      await getManager().transaction(async transactionManager => {
        await transactionManager.save(
          CodSupplierInvoice,
          supplierInvoice,
        );

        // update data transaction detail, add FK supplier invoice id
        await transactionManager.update(
          CodTransactionDetail,
          {
            partnerId: payload.partnerId,
            transactionStatusId: 400000,
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
    payload: WebCodSupplierInvoicePayloadVm,
  ): Promise<WebCodSupplierInvoicePaidResponseVm> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    const timestamp = moment().toDate();
    const dataError = [];

    // TODO: loop data find and update transaction detail
    // update awb history, with awb status paid
    if (!payload.data.length) {
      throw new BadRequestException('Data yang dikirim kosong!');
    }

    for (const item of payload.data) {
      const detail = await CodTransactionDetail.findOne({
        where: {
          awbItemId: item.awbItemId,
          transactionStatusId: Not(45000),
          isDeleted: false,
        },
      });
      if (detail) {
        // // update data detail transaction status awb 45000 [PAID]
        // await CodTransactionDetail.update(
        //   {
        //     codTransactionDetailId: detail.codTransactionDetailId,
        //   },
        //   {
        //     transactionStatusId: 45000,
        //     updatedTime: timestamp,
        //     userIdUpdated: authMeta.userId,
        //   },
        // );
      } else {
        // NOTE: push message error
        const errorMessage = `data resi ${
          item.awbNumber
        } tidak valid, atau sudah di proses!`;
        dataError.push(errorMessage);
      }
    } // end of loop

    // response
    const result = new WebCodSupplierInvoicePaidResponseVm();
    result.status = 'ok';
    result.message = 'success';
    result.dataError = dataError;
    return result;
  }

  static async supplierInvoiceAdd() {
  }

  static async supplierInvoiceRemove() {
  }

  static async listInvoice(
    payload: BaseMetaPayloadVm,
  ): Promise<WebCodListInvoiceResponseVm> {
    // mapping field
    payload.fieldResolverMap['transactionStatus'] = 't2.status_title';
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
      ['t2.status_title', 'transactionStatus'],
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
}
