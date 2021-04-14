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

export class PartnerDivaService {

  static async checkAwb(
    payload: CheckSpkPayloadVm,
  ): Promise<CheckSpkResponseVM> {
    const partner = AuthService.getPartnerTokenPayload();
    return await this.checkAwbProcess(payload);
  }

  private static async checkAwbProcess(
    payload: CheckSpkPayloadVm,
    // partnerId: number,
    // dropPartnerType: string,
  ): Promise<any> {
    const result = new CheckSpkResponseVM();
    const data = [];
    const rawQuery = `
      SELECT
        prd.ref_awb_number,
        e.fullname,
        e.nik
      FROM do_pickup_partner dpp
      INNER JOIN do_pickup_partner_detail dppd on dpp.do_pickup_partner_id = dppd.do_pickup_partner_id and dppd.is_deleted = FALSE
      INNER JOIN pickup_request_detail prd ON dppd.work_order_id = prd.work_order_id_last AND prd.is_deleted = FALSE
      LEFT JOIN work_order wo ON prd.work_order_id_last = wo.work_order_id AND wo.is_deleted = FALSE
      LEFT JOIN employee e ON wo.employee_id_driver = e.employee_id AND e.is_deleted = FALSE
      WHERE
        dpp.do_pickup_partner_code = '${escape(payload.spk_code)}' AND
        dpp.is_deleted = FALSE
      ;
    `;
    const resultData = await RawQueryService.query(rawQuery);
    if (resultData.length > 0 ) {
      for (let a = 0; a < resultData.length; a++) {
        data.push({
          awb_number: resultData[a].ref_awb_number,
          employee_name: resultData[a].fullname,
          employee_nik: resultData[a].nik,
        });
      }
      result.statusCode = HttpStatus.OK;
      result.message = 'Check Spk Success';
      result.data = data;
      return result;

    } else {
      throw new BadRequestException(`Can't Find SPK Code: ` + payload.spk_code);
    }
  }

}
