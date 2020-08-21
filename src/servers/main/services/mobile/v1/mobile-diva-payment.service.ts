import axios from 'axios';
import moment = require('moment');
import { ConfigService } from '../../../../../shared/services/config.service';
import { ServiceUnavailableException, BadRequestException } from '@nestjs/common';
import { WinstonLogglyService } from '../../../../../shared/services/winston-loggly.service';

export class V1MobileDivaPaymentService {
  constructor() {
  }

  private static get sicepatKlikConfig() {
    return {
      headers: {
        'Content-Type': 'application/json',
        'api-key': ConfigService.get('divaPayment.apiKey'),
      },
    };
  }

  static async getTestQR(): Promise<any> {
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
    const now = Date.now();
    axios
      .post(
        'https://apiv2.mdd.co.id:51347/v1/shopee/get-qr',
        {
          token: 'f66046c79e4047c299fbf8abdf6cb3b2',
          mid: '5b4e9699dd603e1aa6687f1d2fe4db95',
          tid: 'sicepat-001',
          amount: 10,
          reff_no: `POD-TEST-MOBILE-${now}`,
        },
        config,
      )
      .then(
        response => {
          console.log('### RESPONSE ::: ', response);
          return response.data;
        },
        error => {
          console.log('### ERROR RESPONSE ::: ', error);
          return error.response.data;
        },
      );
  }

  static async pingQR() {
    const url = `${ConfigService.get('divaPayment.urlQR')}/v1`;
    try {
      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      throw new ServiceUnavailableException(error.message);
    }
  }

  static async getQr(payload: any): Promise<any> {
    // validate
    if (!payload.provider || !payload.amount) {
      throw new BadRequestException('provider dan amount harap diisi!');
    }

    const provider: string = payload.provider;
    const amount: number = Number(payload.amount);

    const now = Date.now();
    const randomNum = Math.floor(Math.random() * 1000); // random 3 digit
    const url = `${ConfigService.get('divaPayment.urlQR')}${provider}`;

    const requestData = {
      token: ConfigService.get('divaPayment.codToken'),
      mid: ConfigService.get('divaPayment.codMid'),
      tid: ConfigService.get('divaPayment.codTid'),
      amount,
      reff_no: `POD-MOBILE-${now}${randomNum}`,
    };

    console.log('### URL :: ', url);
    console.log('### DATA :: ', requestData);

    try {
      const response = await axios.post(url, requestData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      // add Loggly data
      WinstonLogglyService.info({ requestData, responseData: response.data });
      return response.data;
    } catch (error) {
      WinstonLogglyService.error({requestData, error: error.response.data});
      throw new ServiceUnavailableException(error.message);
    }
  }

  static async sendQr(requestData: any): Promise<any> {
    const url = `${ConfigService.get('divaPayment.sicepatKlikUrl')}/postqr`;
    try {
      const response = await axios.post(url, requestData, this.sicepatKlikConfig);
      // add Loggly data
      WinstonLogglyService.info({requestData, responseData: response.data});
      return response.data;
    } catch (error) {
      WinstonLogglyService.error({requestData, error: error.response.data});
      throw new ServiceUnavailableException(error.message);
    }
  }

  static async paymentStatus(requestData: any): Promise<any> {
    const url = `${ConfigService.get('divaPayment.sicepatKlikUrl')}/get-payment-status`;
    try {
      const response = await axios.post(url, requestData, this.sicepatKlikConfig);
      // add Loggly data
      WinstonLogglyService.info({ requestData, responseData: response.data });
      return response.data;
    } catch (error) {
      WinstonLogglyService.error({requestData, error: error.response.data});
      throw new ServiceUnavailableException(error.message);
    }
  }

}
