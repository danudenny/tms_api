import { AwbService } from '../v1/awb.service';
import { WebDeliveryVendorOutPayload, WebDeliveryVendorOutSendPayload } from '../../models/web-delivery-vendor-out-payload.vm';
import { WebDeliveryVendorOutResponseVm, WebDeliveryVendorOutResponse } from '../../models/web-delivery-vendor-out-response.vm';
import moment = require('moment');
import { AuthService } from '../../../../shared/services/auth.service';
import { AwbStatusService } from '../master/awb-status.service';
import { AwbItemAttr } from '../../../../shared/orm-entity/awb-item-attr';
import { RedisService } from '../../../../shared/services/redis.service';
import e = require('express');

export class WebDeliveryVendorOutService {
  static async validateAWB(payload : WebDeliveryVendorOutPayload): Promise<WebDeliveryVendorOutResponseVm>{
    const result = new WebDeliveryVendorOutResponseVm();
    const dataItem = [];
    for (const awbNumber of payload.awbNumber) {
      const awb = await AwbService.validAwbNumber(awbNumber);
      const response = new WebDeliveryVendorOutResponse();
      if(awb){
        const checkValidAwbStatusIdLast = await AwbStatusService.checkValidAwbStatusIdLast(awb, false, false);
        if(checkValidAwbStatusIdLast){
          response.status = 'ok';
          response.message = 'Resi ${awbNumber} Berhasil di Validasi';
        }else{
          response.status = 'error';
          response.message = checkValidAwbStatusIdLast.message;
        }
      }else{
        response.status = 'error';
        response.message = `Resi ${awbNumber} Tidak di Temukan`;
      }

      dataItem.push(response);
    }

    result.data = dataItem
    return result;
  }

  static async scanVendor(payload : WebDeliveryVendorOutSendPayload): Promise<WebDeliveryVendorOutResponseVm>{
    const result = new WebDeliveryVendorOutResponseVm();
    const dataItem = [];
    for (const awbNumber of payload.awbNumber) {
      const awb = await AwbItemAttr.findOne({
        select :['awbNumber','awbItemId'],
        where :{
          awbNumber : awbNumber,
          isDeleted : false,
        }
      });

      const holdRedis = await RedisService.lockingWithExpire(
        `hold:scanoutvendor:${awb.awbItemId}`,
        'locking',
        60,
      );
    }
    return result;
  }
}