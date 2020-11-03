import { DropCashlessVm, DropCashLessResponseVM, DropPickupRequestResponseVM, DropCreateWorkOrderPayloadVM, CheckDataDropPartnerVm, DropSuccessResponseVm } from '../../models/partner/fastpay-drop.vm';
import moment = require('moment');
import { BadRequestException, HttpStatus } from '@nestjs/common';
import { RawQueryService } from '../../../../shared/services/raw-query.service';
import { In } from 'typeorm';
import { AuthService } from '../../../../shared/services/auth.service';
import { HelpdeskPayloadVm, HelpdeskResponseVM } from '../../models/internal/helpdesk.vm';
import { Awb } from 'src/shared/orm-entity/awb';
import { AwbItem } from 'src/shared/orm-entity/awb-item';

export class InternalHelpdeskService {

  static async checkAwb(
    payload: HelpdeskPayloadVm,
  ): Promise<HelpdeskResponseVM> {
    const result = new HelpdeskResponseVM();
    const data = [];
    let resultSla = 0;
    const resultCheckAwb = await Awb.findOne({
      where: {
        awbNumber: payload.awbNumber,
        isDeleted: false,
      },
    });
    if (resultCheckAwb) {
      if (payload.claimPaymentDate && payload.claimInvoiceDate) {
        const admission = moment(payload.claimInvoiceDate, 'YYYY-MM-DD');
        const discharge = moment(payload.claimPaymentDate, 'YYYY-MM-DD');
        resultSla = discharge.diff(admission, 'days');
        // resultSla = payload.claimPaymentDate.getDate() - payload.claimInvoiceDate.getDate();
        console.log(admission);
        console.log(discharge);
        console.log(resultSla);
        console.log('=============TEST==========');
      }
      await Awb.update(
        { awbId : resultCheckAwb.awbId },
        {
          claimInvoiceDate: payload.claimInvoiceDate,
          claimInvoiceCode: payload.claimInvoiceCode,
          claimSpecialCase: payload.claimSpecialCase,
          claimTermType: payload.claimTermType,
          claimPaymentDate: payload.claimPaymentDate,
          claimnSlaPayment: resultSla,
          userIdUpdated: 1,
          updatedTime: moment().toDate(),
        },
      );

      await AwbItem.update(
        { awbId : resultCheckAwb.awbId },
        {
          claimInvoiceDate: payload.claimInvoiceDate,
          claimInvoiceCode: payload.claimInvoiceCode,
          claimSpecialCase: payload.claimSpecialCase,
          claimTermType: payload.claimTermType,
          claimPaymentDate: payload.claimPaymentDate,
          claimnSlaPayment: resultSla,
          userIdUpdated: 1,
          updatedTime: moment().toDate(),
        },
      );
      data.push({
        claimInvoiceDate: payload.claimInvoiceDate,
        claimInvoiceCode: payload.claimInvoiceCode,
        claimSpecialCase: payload.claimSpecialCase,
        claimTermType: payload.claimTermType,
        claimPaymentDate: payload.claimPaymentDate,
        claimnSlaPayment: resultSla,
      });
      result.statusCode = HttpStatus.OK;
      result.message = 'AWB Success Updated';
      result.data = data;
      return result;
    } else {
      throw new BadRequestException(`Can't Find AWB : ` + payload.awbNumber);
    }
  }

}
