import { DropCashlessVm, DropCashLessResponseVM, DropPickupRequestResponseVM, DropCreateWorkOrderPayloadVM, CheckDataDropPartnerVm, DropSuccessResponseVm } from '../../models/partner/fastpay-drop.vm';
import moment = require('moment');
import { BadRequestException, HttpStatus } from '@nestjs/common';
import { RawQueryService } from '../../../../shared/services/raw-query.service';
import { WorkOrder } from '../../../../shared/orm-entity/work-order';
import { CustomCounterCode } from '../../../../shared/services/custom-counter-code.service';
import { WorkOrderDetail } from '../../../../shared/orm-entity/work-order-detail';
import { PickupRequestDetail } from '../../../../shared/orm-entity/pickup-request-detail';
import { WorkOrderHistory } from '../../../../shared/orm-entity/work-order-history';
import { In } from 'typeorm';
import { AuthService } from '../../../../shared/services/auth.service';
import { CheckSpkVm, CheckSpkResponseVM, CheckSpkPayloadVm } from '../../models/partner/diva.vm';
import { DeleteTaxResponseVM, DeteleTaxPayloadVm, UpdateTaxPayloadVm, UpdateTaxResponseVM } from '../../models/partner/internal-tms.vm';

export class InternalTmsService {

  static async deleteAwb(
    payload: DeteleTaxPayloadVm,
  ): Promise<DeleteTaxResponseVM> {
    const partner = AuthService.getPartnerTokenPayload();
    return await this.deleteAwbProcess(payload);
  }

  private static async deleteAwbProcess(
    payload: DeteleTaxPayloadVm,
  ): Promise<any> {
    const result = new DeleteTaxResponseVM();
    const data = [];
    const rawQuery = `
      SELECT
        ref_awb_number
      FROM awb_tax_summary
      WHERE
        ref_awb_number = '${escape(payload.ref_awb_number)}' AND
        is_deleted = FALSE
      ;
    `;
    const resultData = await RawQueryService.query(rawQuery);
    if (resultData.length > 0 ) {
      const rawQueryDelete = `
        UPDATE awb_tax_summary
        SET is_deleted = true
        WHERE
          ref_awb_number = '${escape(payload.ref_awb_number)}'
        ;
      `;
      await RawQueryService.query(rawQueryDelete, null, false);

      data.push({
        ref_awb_number: payload.ref_awb_number,
        is_deleted: true,
      });
      result.statusCode = HttpStatus.OK;
      result.message = 'Awb Success Deleted';
      result.data = data;
      return result;

    } else {
      throw new BadRequestException(`Can't Find Awb: ` + payload.ref_awb_number);
    }
  }

  static async updateAwb(
    payload: UpdateTaxPayloadVm,
  ): Promise<UpdateTaxResponseVM> {
    const partner = AuthService.getPartnerTokenPayload();
    return await this.updateAwbProcess(payload);
  }

  private static async updateAwbProcess(
    payload: UpdateTaxPayloadVm,
  ): Promise<any> {
    const result = new UpdateTaxResponseVM();
    const data = [];
    const rawQuery = `
      SELECT
        ref_awb_number,
        tax_id,
        item_price
      FROM awb_tax_summary
      WHERE
        ref_awb_number = '${escape(payload.ref_awb_number)}' AND
        is_deleted = FALSE
      ;
    `;
    const resultData = await RawQueryService.query(rawQuery);
    if (resultData.length > 0 ) {
      const rawQueryTax = `
        SELECT 
          tax_value,
          tax_pph,
          import_duty_value
        FROM tax
        WHERE
          tax_id = '${escape(resultData[0].tax_id)}'
        ;
      `;
      const resultDataTax = await RawQueryService.query(rawQueryTax);
      if (resultDataTax) {
        const paramImportDutyFee = payload.item_price * (resultDataTax[0].import_duty_value / 100);
        const param_ppn = (payload.item_price + paramImportDutyFee) * (resultDataTax[0].tax_value / 100);
        const param_pph = (payload.item_price + paramImportDutyFee) * (resultDataTax[0].tax_pph / 100);
        const param_total = paramImportDutyFee + param_ppn + param_pph;
        const rawQueryDelete = `
          UPDATE awb_tax_summary
          SET item_price = '${(payload.item_price)}',
              import_duty_fee = '${(paramImportDutyFee)}',
              ppn_fee = '${(param_ppn)}',
              pph_fee = '${(param_pph)}',
              subtotal = '${(param_total)}'
          WHERE
            ref_awb_number = '${escape(payload.ref_awb_number)}'
          ;
        `;
      await RawQueryService.query(rawQueryDelete, null, false);
        data.push({
          ref_awb_number: payload.ref_awb_number,
          import_duty_fee: paramImportDutyFee,
          ppn_fee: param_ppn,
          pph_fee: param_pph,
          total_fee: param_total,
        });
        result.statusCode = HttpStatus.OK;
        result.message = 'Awb Success Updated';
        result.data = data;
        return result;
      } else {
        throw new BadRequestException(`Can't Find Tax Id: ` + resultData[0].tax_id);
      }
    } else {
      throw new BadRequestException(`Can't Find Awb: ` + payload.ref_awb_number);
    }
  }

}
