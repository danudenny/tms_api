
import { ConfigService } from '../../../../../shared/services/config.service';
import { BadRequestException } from '@nestjs/common';
import { WinstonLogglyService } from '../../../../../shared/services/winston-loggly.service';
import axios from 'axios';
import { RedisService } from '../../../../../shared/services/redis.service';
import { DivaData } from '../../../../../shared/orm-entity/diva-data';

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

    const randomTID = await this.getRandomTID();
    const requestData = {
      token: ConfigService.get('divaPayment.codToken'),
      mid: ConfigService.get('divaPayment.codMid'),
      tid: randomTID,
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

  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random#Getting_a_random_integer_between_two_values_inclusive
  private static randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private static async getRandomTID(): Promise<string> {
    let result = 'sicepat001';
    // check data on redis
    const dataRedis = await RedisService.get(`diva:payments:tid`);
    if (dataRedis) {
      const dataArray: [] = dataRedis.split(',');
      const index = this.randomInteger(1, dataArray.length);
      result = dataArray[index];
    } else {
      // get data on db and set data redis
      const dataDb = await DivaData.find();
      if (dataDb && dataDb.length) {
        const tidArray = dataDb.map(item => {
          return item.tid;
        });
        await RedisService.set(
          `diva:payments:tid`,
          tidArray.toString(),
        );
        const index = this.randomInteger(1, tidArray.length);
        result = tidArray[index];
      }
    }
    return result;
  }
}
