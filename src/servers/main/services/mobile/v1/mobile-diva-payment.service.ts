
import { ConfigService } from '../../../../../shared/services/config.service';
import { ServiceUnavailableException, BadRequestException } from '@nestjs/common';
import { WinstonLogglyService } from '../../../../../shared/services/winston-loggly.service';
import axios from 'axios';

export class V1MobileDivaPaymentService {
  constructor() {}

  private static get sicepatKlikConfig() {
    return {
      headers: {
        'Content-Type': 'application/json',
        'api-key': ConfigService.get('divaPayment.apiKey'),
      },
    };
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
      return error.response.data;
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

    try {
      const response = await axios.post(url, requestData, {
        headers: {
          'Content-Type': 'application/json',
          'Connection': 'keep-alive',
          'User-Agent': 'POD-API',
        },
      });
      // add Loggly data
      WinstonLogglyService.info({ requestData, responseData: response.data });
      return response.data;
    } catch (error) {
      WinstonLogglyService.error({requestData, error: error.response.data});
      return error.response.data;
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
      return error.response.data;
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
      return error.response.data;
    }
  }
}