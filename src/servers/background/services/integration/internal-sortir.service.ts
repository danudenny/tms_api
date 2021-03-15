import moment = require('moment');
import { BadRequestException, HttpStatus } from '@nestjs/common';
import { RawQueryService } from '../../../../shared/services/raw-query.service';
import { AuthService } from '../../../../shared/services/auth.service';
import { CheckAwbPayloadVm, CheckAwbResponseVM } from '../../models/internal-sortir.vm';

export class InternalSortirService {

  static async checkAwb(
    payload: CheckAwbPayloadVm,
  ): Promise<CheckAwbResponseVM> {
    const partner = AuthService.getPartnerTokenPayload();
    return await this.checkAwbProcess(payload);
  }

  private static async checkAwbProcess(
    payload: CheckAwbPayloadVm,
    // partnerId: number,
    // dropPartnerType: string,
  ): Promise<any> {
    const result = new CheckAwbResponseVM();
    const data = [];
    let zip_code;
    let is_cod;
    const rawQueryAwb = `
      SELECT
        consignee_zip,
        is_cod,
        awb_number
      FROM awb
      WHERE
        awb_number = '${escape(payload.tracking_number)}'
      ;
    `;
    const resultDataAwb = await RawQueryService.query(rawQueryAwb);
    if (resultDataAwb.length > 0 ) {
      for (let a = 0; a < resultDataAwb.length; a++) {
        zip_code = resultDataAwb[a].consignee_zip,
        is_cod = resultDataAwb[a].is_cod
      }

      if ((is_cod) || (is_cod == true)) {
        is_cod = true;
      } else {
        is_cod = false;
      }

      if((zip_code == null) || (zip_code.trim() == '')) {
        throw new BadRequestException(`Zip Code not found”`);
      }

      const rawQuery = `
        SELECT bs.*
        FROM branch_sortir bs
        INNER JOIN branch b ON bs.branch_id_lastmile = b.branch_id AND b.is_deleted = FALSE
        INNER JOIN district d ON b.district_id = d.district_id AND d.is_deleted = FALSE
        INNER JOIN sub_district sd ON d.district_id = sd.district_id AND sd.is_deleted = FALSE
        WHERE
          bs.is_deleted = FALSE AND
          sd.zip_code = '${escape(zip_code)}' AND
          bs.is_cod = ${escape(is_cod)} AND
          bs.branch_id = ${payload.sorting_branch_id} 
        ;
      `;
      const resultData = await RawQueryService.query(rawQuery);
      if (resultData.length > 0 ) {
        for (let a = 0; a < resultData.length; a++) {
          data.push({
            tracking_number: payload.tracking_number,
            chute_number: resultData[a].no_chute,
            request_time: moment().format('DD/MM/YYYY, h:mm:ss a')
          });
        }
        result.statusCode = HttpStatus.OK;
        result.message = 'Check Spk Success';
        result.data = data;
        return result;

      } else {
        throw new BadRequestException(`Can't Find Chute For AWB: ` + payload.tracking_number);
      }
    } else {
      throw new BadRequestException(`Can't Find AWB: ` + payload.tracking_number);
    }

  }

}
