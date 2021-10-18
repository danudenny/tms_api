import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { UpdateRepresentativeManualPayload } from '../../models/smd-helpdesk-payload.vm';
import { BagRepresentative } from '../../../../shared/orm-entity/bag-representative';
import { RawQueryService } from '../../../../shared/services/raw-query.service';
import { Representative } from '../../../../shared/orm-entity/representative';
import { UpdateRepresentativeManualResponse } from '../../models/smd-helpdesk-response.vm';

@Injectable()
export class SmdHelpdeskService {
  static async updateRepresentativeCodeManual(payload: UpdateRepresentativeManualPayload): Promise <any> {
    try {

      const result = new UpdateRepresentativeManualResponse();
      result.statusCode = HttpStatus.BAD_REQUEST;
      // check bag_representative
      const query = `SELECT
        br.bag_representative_code,
        br.bag_representative_id,
        br.representative_id_to,
        r.representative_code
      FROM bag_representative br
      INNER JOIN representative r ON r.representative_id = br.representative_id_to
      WHERE br.bag_representative_code = '${payload.bag_representative_code}' AND
      br.is_deleted = FALSE`;
      const bagRepresentative = await RawQueryService.query(query);
      if (bagRepresentative.length < 1) {
        // bag_representative_code not found
        result.message = 'bag_representative_code not found';
        return result;
      }

      if (bagRepresentative[0].representative_code != 'XXX') {
        // representative_code sudah sesuai
        result.message = 'representative_code sudah sesuai';
        return result;
      }

      // get representative
      const getRepresentative = await Representative.findOne({
        where: {
          representativeCode: payload.representative_code_new,
        },
      });

      if (!getRepresentative) {
        // representative not found
        result.message = 'representative_code not found';
        return result;
      }

      // update new representative
      await BagRepresentative.update({ bagRepresentativeId: bagRepresentative[0].bag_representative_id }, { representativeIdTo: getRepresentative.representativeId.toString() });
      // response success
      result.statusCode = HttpStatus.OK;
      result.message = 'update representative_code success';
      return result;
    } catch (e) {
      console.error(e.message);
      throw new BadRequestException(`Internal Server Error`);
    }
  }
}