import axios from 'axios';
import { ConfigService } from '../../shared/services/config.service';
import { RequestErrorService } from '../../shared/services/request-error.service';
import { HttpStatus } from '@nestjs/common';
import { SlackUtil } from '../util/slack';
import { AuthService } from '../../shared/services/auth.service';

export class VendorLogisticService {
  public static get queryServiceUrl() {
    return ConfigService.get('vendorLogisticService.baseUrl');
  }

  public static async sendVendor(awbNumber, vendorId, orderVendorCode) {
    const authMeta = AuthService.getAuthMetadata();
    const permissonPayload = AuthService.getPermissionToken();
    let url = `${this.queryServiceUrl}order/vendor`;
    const options = {
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'x-user-id' : authMeta.userId.toString(),
        'x-channel-id' : authMeta.clientId.toString(),
        'x-permission-token' : permissonPayload
      }
    };

    const body = {
      awb_no: awbNumber,
      vendor_id: vendorId,
      order_vendor_code : orderVendorCode
    };
    
    try{
      const request = await axios.post(url, body, options);
      console.log(request.data)
      return request.data;
    }catch(err){
      RequestErrorService.throwObj(
        {
          message: 'Error while hit service send vendor',
          error: err
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  public static async getDataSuratJalan(orderVendorCode, userId) {
    let url = `${this.queryServiceUrl}vendor/order/detail`;
    const options = {
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'x-user-id' : userId,
        'x-channel-id' : 'web'
      },
      params: {
        order_vendor_code: orderVendorCode,
        page : 0,
        limit : 0
      }
    };

    console.log(options);
    try{
      const request = await axios.get(url, options);
      console.log(request.data)
      return request.data;
    }catch(err){
      console.log(err)
      RequestErrorService.throwObj(
        {
          message: 'Error while hit service get data vendor detail',
          error: err
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}