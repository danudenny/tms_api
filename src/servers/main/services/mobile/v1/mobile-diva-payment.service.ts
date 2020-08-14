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

  static async getQr(payload: any): Promise<any> {
    // validate
    if (!payload.provider || !payload.amount) {
      throw new BadRequestException('provider dan amount harap diisi!');
    }

    const provider: string = payload.provider;
    const amount = payload.amount;

    const now = Date.now();
    const randomNum = Math.floor(Math.random() * 1000); // random 3 digit
    const url = `${ConfigService.get('divaPayment.urlQR')}${provider}`;
    const configOpt = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const requestData = {
      token: ConfigService.get('divaPayment.codToken'),
      mid: ConfigService.get('divaPayment.codMid'),
      tid: ConfigService.get('divaPayment.codTid'),
      amount,
      reff_no: `POD-MOBILE-${now}${randomNum}`,
    };
    try {
      const response = await axios.post(url, requestData, configOpt);
      // add Loggly data
      WinstonLogglyService.info({ requestData, responseData: response });
      return response;
    } catch (error) {
      WinstonLogglyService.error({ requestData, error });
      throw new ServiceUnavailableException(error);
    }
  }

  static async sendQr(requestData: any): Promise<any> {
    const url = `${ConfigService.get('divaPayment.sicepatKlikUrl')}/postqr`;
    try {
      const response = await axios.post(url, requestData, this.sicepatKlikConfig);
      // add Loggly data
      WinstonLogglyService.info({requestData, responseData: response});
      return response;
    } catch (error) {
      WinstonLogglyService.error({ requestData, error });
      throw new ServiceUnavailableException(error);
    }
  }

  static async paymentStatus(requestData: any): Promise<any> {
    const url = `${ConfigService.get('divaPayment.sicepatKlikUrl')}/get-payment-status`;
    try {
      const response = await axios.post(url, requestData, this.sicepatKlikConfig);
      // add Loggly data
      WinstonLogglyService.info({ requestData, responseData: response });
      return response;
    } catch (error) {
      WinstonLogglyService.error({ requestData, error });
      throw new ServiceUnavailableException(error);
    }
  }

}
