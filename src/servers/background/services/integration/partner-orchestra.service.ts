import { PartnerOrchestraPayloadVm, PartnerOrchestraResponseVm } from '../../models/partner/orchestra-task.vm';
import moment = require('moment');
import { RawQueryService } from '../../../../shared/services/raw-query.service';
import { AwbHistory } from '../../../../shared/orm-entity/awb-history';
import { AwbItemAttr } from '../../../../shared/orm-entity/awb-item-attr';
import { DoPodDetailPostMetaQueueService } from '../../../queue/services/do-pod-detail-post-meta-queue.service';
import { AWB_STATUS } from '../../../../shared/constants/awb-status.constant';
import { HttpStatus } from '@nestjs/common';


export class PartnerOrchestraService {

  static async createAwbHistory(
    payload: PartnerOrchestraPayloadVm,
  ): Promise<PartnerOrchestraResponseVm> {
    const result = new PartnerOrchestraResponseVm();

    const dateNow = moment().toDate();
    
    if(payload.receipt_number == "" || payload.timestamp == null ) {
      result.message = 'Payload is missing';
      return result
    }

    const awb = await AwbItemAttr.findOne({
      where: {
        awbNumber: payload.receipt_number,
        isDeleted: false,
      },
    });

    if (!awb) {
      result.statusCode = HttpStatus.BAD_REQUEST;
      result.message = 'AWB Not Found';
      return result;
    }


    const awbHistory = await AwbHistory.findOne({
      where: {
        awbItemId: awb.awbItemId,
        awbStatusId: AWB_STATUS.DONE_HO, // hand over
        isDeleted: false,
      },
    });

    if (awbHistory) {
      result.statusCode = HttpStatus.BAD_REQUEST;
      result.message = 'AWB History has been created';
      return result;
    } else {
      DoPodDetailPostMetaQueueService.createAwbHandoverStatus(
        awb.awbItemId,
        1,
        payload.timestamp,
        AWB_STATUS.DONE_HO,
        awb.awbNumber,
        awb.awbId,
        dateNow,
        'Paket telah berhasil di handover ke 3pl partner'
      );
      
      result.statusCode = HttpStatus.OK;
      result.message = "Success";
      return result;
    }
  }
}
