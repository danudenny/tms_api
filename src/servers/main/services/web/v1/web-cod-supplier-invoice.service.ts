import { Not } from 'typeorm';

import { BadRequestException } from '@nestjs/common';

import { BaseMetaPayloadVm } from '../../../../../shared/models/base-meta-payload.vm';
import { CodBankStatement } from '../../../../../shared/orm-entity/cod-bank-statement';
import {
    CodTransactionBranchDetail,
} from '../../../../../shared/orm-entity/cod-transaction-branch-detail';
import { AuthService } from '../../../../../shared/services/auth.service';
import { MetaService } from '../../../../../shared/services/meta.service';
import { OrionRepositoryService } from '../../../../../shared/services/orion-repository.service';
import { WebCodSupplierInvoicePayloadVm } from '../../../models/cod/web-awb-cod-payload.vm';
import {
    WebAwbCodSupplierInvoiceResponseVm, WebCodSupplierInvoicePaidResponseVm,
} from '../../../models/cod/web-awb-cod-response.vm';
import moment = require('moment');

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

    const repo = new OrionRepositoryService(CodTransactionBranchDetail, 't1');
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

    // q.innerJoin(e => e.transactionStatus, 't3', j =>
    //   j.andWhere(e => e.isDeleted, w => w.isFalse()),
    // );

    q.andWhere(e => e.isDeleted, w => w.isFalse());
    // q.andWhere(e => e.transactionStatusId, w => w.equals(40000));
    q.groupByRaw('t2.partner_id');

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new WebAwbCodSupplierInvoiceResponseVm();

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
      const detail = await CodTransactionBranchDetail.findOne({
        where: {
          awbItemId: item.awbItemId,
          transactionStatusId: Not(45000),
          isDeleted: false,
        },
      });
      if (detail) {
        // update data detail transaction status awb 45000 [PAID]
        await CodTransactionBranchDetail.update(
          {
            codTransactionBranchDetailId: detail.codTransactionBranchDetailId,
          },
          {
            transactionStatusId: 45000,
            updatedTime: timestamp,
            userIdUpdated: authMeta.userId,
          },
        );
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
}
