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

  public static async sendVendor(awbNumber, vendorId, orderVendorCode, userId, tokenPayload) {
    let url = `${this.queryServiceUrl}vendor/order?is_retry=false`;
    const options = {
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'x-user-id': userId,
        'x-channel-id': 'web',
        'x-permission-token': tokenPayload
      }
    };

    const body = {
      // awb_no: [awbNumber],
      awb_no : awbNumber,
      vendor_id: vendorId,
      order_vendor_code: orderVendorCode
    };

    let channelSlack = await ConfigService.get('vendorLogisticService.slackChannel');
    try {
      const request = await axios.post(url, body, options);
      return request;
    } catch (err) {
      console.log(err)
      await SlackUtil.sendMessage(channelSlack, "Error from hit service for send vendor - awb : "+awbNumber, err.stack, body, null, null, url);
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
    let channelSlack = await ConfigService.get('vendorLogisticService.slackChannel');
    const options = {
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'x-user-id': userId,
        'x-channel-id': 'web'
      },
      params: {
        order_vendor_code: orderVendorCode,
        page: 0,
        limit: 0
      }
    };

    try {
      const request = await axios.get(url, options);
      return request.data;
    } catch (err) {
      await SlackUtil.sendMessage(channelSlack,"Error from hit service for get vendor detail",err.stack, options, null, null, url);
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