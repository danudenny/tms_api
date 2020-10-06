// #region import
import { ConfigService } from '../../../../../shared/services/config.service';
import { BadRequestException } from '@nestjs/common';
import { WinstonLogglyService } from '../../../../../shared/services/winston-loggly.service';
import axios from 'axios';
import { RedisService } from '../../../../../shared/services/redis.service';
import { DivaData } from '../../../../../shared/orm-entity/diva-data';

import nr = require('newrelic');
// #endregion
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
    let response = null;
    await nr.startBackgroundTransaction('DIVA - Ping QR', async function transactionHandler() {
      const transaction = nr.getTransaction();
      const url = `${ConfigService.get('divaPayment.urlQR')}/v1`;
      try {
        response = await axios.get(url, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        // End Transaction for newrelic
        transaction.end();
      } catch (error) {
        nr.noticeError(error);
        transaction.end();
        return error.response.data;
      }
    });

    return response.data;
  }

  static async getQr(payload: any): Promise<any> {
    let result = null;
    await nr.startBackgroundTransaction('DIVA - Get QR', async function transactionHandler() {
      const transaction = nr.getTransaction();
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
        // End Transaction for newrelic
        transaction.end();
        result = response.data;
      } catch (error) {
        WinstonLogglyService.error({requestData, error: error.response.data});
        result = error.response.data;
        nr.noticeError(error);
        transaction.end();
      }
    });

    return result;
  }

  static async sendQr(requestData: any): Promise<any> {
    let result = null;
    await nr.startBackgroundTransaction('DIVA - Send QR', async function transactionHandler() {
      const transaction = nr.getTransaction();
      const url = `${ConfigService.get('divaPayment.sicepatKlikUrl')}/postqr`;
      try {
        const response = await axios.post(url, requestData, this.sicepatKlikConfig);
        // add Loggly data
        WinstonLogglyService.info({requestData, responseData: response.data});
        result = response.data;
        // End Transaction for newrelic
        transaction.end();
      } catch (error) {
        WinstonLogglyService.error({requestData, error: error.response.data});
        nr.noticeError(error);
        transaction.end();
        result = error.response.data;
      }
    });

    return result;
  }

  static async paymentStatus(requestData: any): Promise<any> {
    let result = null;
    await nr.startBackgroundTransaction('DIVA - Payment Status', async function transactionHandler() {
      const transaction = nr.getTransaction();
      const url = `${ConfigService.get('divaPayment.sicepatKlikUrl')}/get-payment-status`;
      try {
        const response = await axios.post(url, requestData, this.sicepatKlikConfig);
        // add Loggly data
        WinstonLogglyService.info({ requestData, responseData: response.data });
        result = response.data;
        // End Transaction for newrelic
        transaction.end();
      } catch (error) {
        WinstonLogglyService.error({requestData, error: error.response.data});
        nr.noticeError(error);
        transaction.end();
        result = error.response.data;
      }
    });

    return result;
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