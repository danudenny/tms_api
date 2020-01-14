import { Injectable } from '@nestjs/common';
import moment = require('moment');
import axios from 'axios';
import { RedisService } from '../../../../shared/services/redis.service';
import { RawQueryService } from '../../../../shared/services/raw-query.service';
import { AwbSendPartner } from '../../../../shared/orm-entity/awb-send-partner';
import { ConfigService } from '../../../../shared/services/config.service';

@Injectable()
export class PartnerService {
  static postIndonesiaBaseUrl = ConfigService.get('posIndonesia.baseUrl');
  static async sendAwbPosIndonesia(
    payload: any,
  ): Promise<any> {
    let result = {};

    // let totalProcess = 0;
    // let awbs = [];
    let retry = 0;
    let validAccessToken = false
    let accessToken = '';

    while (validAccessToken == false || retry <=2) {
      retry++;
      accessToken = await this.getAccessTokenPosIndonesia();
      if (accessToken != '') {
        validAccessToken = true
      }
    }

    if (validAccessToken) {
      let arrAwb = [];

      // Notes: Pos Indonesia Use All Awb
      const data = await this.getAwb();

      if (data) {
        arrAwb = await this.sendPosIndonesia(data, accessToken.toString());
      }
      result = {
        'code': '200',
        'message': 'Success',
        'awb': arrAwb
      }
    } else {
      result = {
        'code': '422',
        'message': 'Invalid Partner Access Token'
      };
    }

    return result;
  }

  static async getAccessTokenPosIndonesia(){
    let accessToken = '';
    let expiresIn = 3500;

    if (RedisService.get('pos-indonesia:access-token')) {
      accessToken = RedisService.get('pos-indonesia:access-token').toString();
      console.log('GET ACCESS TOKEN FROM REDIS');
      return accessToken
    }

    const urlToken = this.postIndonesiaBaseUrl + ConfigService.get('posIndonesia.tokenEndpoint')
    const params = {
      'grant_type': 'client_credentials'
    };
    const auth = {
      'username': ConfigService.get('posIndonesia.username'),
      'password': ConfigService.get('posIndonesia.password')
    };
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
    }

    const config = {
      auth: auth,
      params: params,
      headers: headers
    }
    try {
      const response = await axios.post(urlToken, null, config);
      console.log(response);
      if (response.data.access_token) {
        accessToken = response.data.access_token;
        expiresIn = response.data.expires_in;
        RedisService.set('posindonesia:access-token', accessToken);
        RedisService.expireat('posindonesia:access-token', Number(expiresIn) - 10)
      }
    } catch (error){
      if (error.response) {
          console.log(error.response);
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
        }
    }

    return accessToken;
  }

  private static async getAwb(partnerId: number = 0): Promise<any> {
    const backDate = moment().add(-3, 'days').toDate();

    const query = `
      SELECT 
        prd.ref_awb_number as "refAwbNumber",
        prd.shipper_name as "shipperName",
        prd.shipper_address as "shipperAddress",
        prd.shipper_district as "shipperDistrict",
        prd.shipper_city as "shipperCity",
        prd.shipper_province as "shipperProvince",
        prd.shipper_zip as "shipperZip",
        prd.recipient_name as "recipientName",
        prd.recipient_address as "recipientAddress",
        prd.recipient_district as "recipientDistrict",
        prd.recipient_city as "recipientCity",
        prd.recipient_province as "recipientProvince",
        prd.recipient_zip as "recipientZip",
        prd.parcel_qty as "parcelQty",
        prd.parcel_value as "parcelValue",
        prd.parcel_content as "parcelContent",
        prd.parcel_length as "parcelLength",
        prd.parcel_width as "parcelWidth",
        prd.parcel_height as "parcelHeight",
        prd.total_weight as "totalWeight",
        pr.pickup_request_email as "pickupRequestEmail",
        a.send_count as "sendCount",
        a.awb_send_partner_id as "awbSendPartnerId",
        a.is_send as "isSend"
      FROM pickup_request_detail prd
      INNER JOIN pickup_request pr ON prd.pickup_request_id=pr.pickup_request_id and pr.is_deleted=false
      LEFT JOIN awb_send_partner a ON prd.ref_awb_number=a.awb_number and a.is_deleted=false
      WHERE prd.created_time >= :backDate and (a.awb_number IS NULL OR a.is_send=false) and prd.is_deleted=false 
      ORDER BY prd.pickup_request_detail_id
      LIMIT 1000
    `;

    return await RawQueryService.queryWithParams(query, {
      backDate,
    });
  }

  private static async sendPosIndonesia(data: any, token: string): Promise<any> {
    let arrAwb = [];
    let partnerId = 0;

    for (const awb of data) {
      let postPartner = await this.postPartnerPosIndonesia(awb, token);

      const timeNow = moment().toDate();
      let isSendPartner = false;
      if (postPartner['code'] == 200) {
        isSendPartner = true;
        arrAwb.push(awb.refAwbNumber);
      }

      if (awb.awbSendPartnerId == null)  {
        let awbSendPartner = AwbSendPartner.create();
        awbSendPartner.partnerId = partnerId;
        awbSendPartner.awbNumber = awb.refAwbNumber;
        awbSendPartner.isSend = isSendPartner;
        awbSendPartner.sendCount = awb.sendCount + 1;
        awbSendPartner.lastSendDateTime = timeNow;
        awbSendPartner.responseCode = postPartner['code'];
        awbSendPartner.responseData = postPartner['data'];
        awbSendPartner.sendData = postPartner['sendData'];
        awbSendPartner.userIdCreated = 0;
        awbSendPartner.userIdUpdated = 0;

        await AwbSendPartner.insert(awbSendPartner);
      } else {
        await AwbSendPartner.update(awb.awbSendPartnerId, {
          isSend: isSendPartner,
          responseCode: postPartner['code'],
          responseData: postPartner['data'],
          sendData: postPartner['sendData'],
          sendCount: (awb.sendCount + 1),
          lastSendDateTime: timeNow,
          userIdUpdated: 0,
          updatedTime: timeNow
        });
      }
      
    }
    return arrAwb;
  }

  private static async postPartnerPosIndonesia(data: any, token: string): Promise<any> {
    const urlPost = this.postIndonesiaBaseUrl + ConfigService.get('posIndonesia.postAwbEndpoint');
 
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    }

    const config = {
      headers: headers
    }

    let jsonData = 
    {
      "userid": 14,
      "memberid": "LOGSICEPAT04100A",
      "orderid": "SCP" + data.refAwbNumber,
      "addresses": [
        {
          "addresstype": "senderlocation",
          "customertype": 1,
          "name": data.shipperName,
          "phone": data.shipperPhone,
          "email": "",
          "address": data.shipperAddress,
          "subdistrict": data.shipperDistrict,
          "city": data.shipperCity,
          "province": data.shipperProvince,
          "zipcode": data.shipperZip,
          "country": "Indonesia",
          "geolang": 0,
          "geolat": 0,
          "description": ""
        },
        {
          "addresstype": "receiverlocation",
          "customertype": 1,
          "name": data.recipientName,
          "phone": data.recipientPhone,
          "email": data.pickupRequestEmail,
          "address": data.recipientAddress,
          "subdistrict": data.recipientDistrict,
          "city": data.recipientCity,
          "province": data.recipientProvince,
          "zipcode": data.recipientZip,
          "country": "Indonesia",
          "geolang": 0,
          "geolat": 0,
          "description": ""
        }
      ],
      "itemdetils": [
        {
          "hscode": "",
          "origincountry": "",
          "description": data.parcelCategory,
          "quantity": data.parcelQty,
          "value": data.parcelValue
        }
      ],
      "itemproperties": {
        "itemtypeid": 1,
        "productid": "871238",
        "valuegoods": 0,
        "weight": data.totalWeight * 1000,
        "length": data.parcelLength,
        "width": data.parcelWidth,
        "height": data.parcelHeight,
        "codvalue": data.codValue,
        "pin": 0,
        "itemdesc": data.parcelContent
      },
      "paymentvalues": [
        {
          "name": "fee",
          "value": 1500
        }
      ],
      "taxes": [
        {
          "name": "fee",
          "value": 15
        }
      ],
      "services": [
        {
          "name": "cod",
          "value": 0
        },
        {
          "name": "pickup",
          "value": 0
        },
        {
          "name": "delivery",
          "value": 0
        }
      ]
    };

    let result = {};
    try {
      console.log('#### START POST AWB POS INDONESIA');
      const response = await axios.post(urlPost, jsonData, config);
      result = {
        'code': response.status,
        'data': response.data,
        'sendData': jsonData
      };
      console.log(response);
      console.log(response.data);
      console.log(response.status);
      console.log(response.headers);
    } catch (error){
      if (error.response) {
          result = {
            'code': error.response.status,
            'data': error.response.data,
            'sendData': ''
          };
          console.log(error.response);
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
        }
    }

    return result;
  }

}
