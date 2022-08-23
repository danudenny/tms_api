import axios from 'axios';
import { ConfigService } from '../../shared/services/config.service';
import { RequestErrorService } from '../../shared/services/request-error.service';
import { HttpStatus } from '@nestjs/common';
import { SlackUtil } from '../util/slack';

export class VendorLogisticService {
  public static get queryServiceUrl() {
    return ConfigService.get('vendorLogisticService.baseUrl');
  }

  public static async sendVendor(awbNumber, vendorId, orderVendorCode) {
    let url = `${this.queryServiceUrl}order/vendor`;
    const options = {
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'x-api-key' : 'xxx'
      }
    };

    const body = {
      awb_no: awbNumber,
      vendor_id: vendorId,
      order_vendor_code : orderVendorCode
    };
    
    try{
      // const request = await axios.post(url, body, options);
      // return request;
      console.log(body);
      return {
        status : 200,
        message : 'ok',
      }
    }catch(err){
      RequestErrorService.throwObj(
        {
          message: 'Error while hit service priority',
          error: err
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}