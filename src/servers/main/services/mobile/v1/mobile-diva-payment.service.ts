// #region import
import { ConfigService } from '../../../../../shared/services/config.service';
import { BadRequestException } from '@nestjs/common';
import { WinstonLogglyService } from '../../../../../shared/services/winston-loggly.service';
import axios from 'axios';
import { RedisService } from '../../../../../shared/services/redis.service';
import { DivaData } from '../../../../../shared/orm-entity/diva-data';
import { MobileCodEReceiptPayloadVm, MobileCodEReceiptResponseVm, MobileCodPaymentStatusPayloadVm } from '../../../models/mobile/mobile-diva-payment.vm';

import nr = require('newrelic');
import moment = require('moment');
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
    await nr.startBackgroundTransaction('DIVA - Ping QR', async () => {
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
    await nr.startBackgroundTransaction('DIVA - Get QR', async () => {
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
        WinstonLogglyService.error({ requestData, error: error.response.data });
        result = error.response.data;
        nr.noticeError(error);
        transaction.end();
      }
    });

    return result;
  }

  static async sendQr(requestData: any): Promise<any> {
    let result = null;
    await nr.startBackgroundTransaction('DIVA - Send QR', async () => {
      const transaction = nr.getTransaction();
      const url = `${ConfigService.get('divaPayment.sicepatKlikUrl')}/postqr`;
      try {
        const response = await axios.post(
          url,
          requestData,
          this.sicepatKlikConfig,
        );
        // add Loggly data
        WinstonLogglyService.info({ requestData, responseData: response.data });
        result = response.data;
        // End Transaction for newrelic
        transaction.end();
      } catch (error) {
        WinstonLogglyService.error({ requestData, error: error.response.data });
        nr.noticeError(error);
        transaction.end();
        result = error.response.data;
      }
    });

    return result;
  }

  static async paymentStatus(requestData: any): Promise<any> {
    let result = null;
    await nr.startBackgroundTransaction('DIVA - Payment Status', async () => {
      const transaction = nr.getTransaction();
      const url = `${ConfigService.get(
        'divaPayment.sicepatKlikUrl',
      )}/get-payment-status`;
      try {
        const response = await axios.post(
          url,
          requestData,
          this.sicepatKlikConfig,
        );
        // add Loggly data
        WinstonLogglyService.info({ requestData, responseData: response.data });
        result = response.data;
        // End Transaction for newrelic
        transaction.end();
      } catch (error) {
        WinstonLogglyService.error({ requestData, error: error.response.data });
        nr.noticeError(error);
        transaction.end();
        result = error.response.data;
      }
    });

    return result;
  }

  static async paymentStatusTrx(
    requestData: MobileCodPaymentStatusPayloadVm,
  ): Promise<any> {
    let result = null;
    await nr.startBackgroundTransaction('DIVA - Payment Status TRX ID', async () => {
      const transaction = nr.getTransaction();
      const url = `${ConfigService.get(
        'divaPayment.sicepatKlikUrl',
      )}/get-payment-status-trx`;
      try {
        const response = await axios.post(
          url,
          requestData,
          this.sicepatKlikConfig,
        );
        result = response.data;
        // End Transaction for newrelic
        transaction.end();
      } catch (error) {
        nr.noticeError(error);
        transaction.end();
        result = error.response.data;
      }
    });

    return result;
  }

  static async shopeePaymentStatus(payload: any): Promise<any> {
    let result = null;
    await nr.startBackgroundTransaction(
      'DIVA - Shopee payment status',
      async () => {
        const transaction = nr.getTransaction();
        const url = `${ConfigService.get(
          'divaPayment.urlQR',
        )}/v1/shopee/status-payment`;
        const randomTID = await this.getRandomTID();
        const requestData = {
          token: ConfigService.get('divaPayment.codToken'),
          mid: ConfigService.get('divaPayment.codMid'),
          tid: randomTID,
          trx_id: payload.trxId,
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
          WinstonLogglyService.info({
            requestData,
            responseData: response.data,
          });
          // End Transaction for newrelic
          transaction.end();
          result = response.data;
        } catch (error) {
          WinstonLogglyService.error({
            requestData,
            error: error.response.data,
          });
          result = error.response.data;
          nr.noticeError(error);
          transaction.end();
        }
      },
    );

    return result;
  }

  static async generateEReceipt(
    payload: MobileCodEReceiptPayloadVm,
  ): Promise<MobileCodEReceiptResponseVm> {
    let result;
    await nr.startBackgroundTransaction(
      'DIVA - generate E-Receipt',
      async () => {
        const transaction = nr.getTransaction();
        const uuidv1 = require('uuid/v1');
        const trxid = uuidv1();
        const url = ConfigService.get('divaPayment.urlEReceipt');
        const phoneNumber = ConfigService.get('divaPayment.waContact');
        const requestData = this.constructReceipt(payload, trxid);

        // response link redirect to WhatsApp
        const redirecLink = {
          redirec_link: `https://wa.me/${phoneNumber}?text=ereceipt%20${trxid}`,
        };

        try {
          const response = await axios.post(url, requestData, {
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': 'POD-API',
            },
          });
          // End Transaction for newrelic
          transaction.end();
          result = {...response.data.response, ...redirecLink};
        } catch (error) {
          // console.error(error);
          nr.noticeError(error);
          transaction.end();
          result = error.response.data;
        }
      },
    );

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
        await RedisService.set(`diva:payments:tid`, tidArray.toString());
        const index = this.randomInteger(1, tidArray.length);
        result = tidArray[index];
      }
    }
    return result;
  }

  private static constructReceipt(payload: MobileCodEReceiptPayloadVm, trxid: string) {
    const currencyFormat =  Number(payload.cod_value).toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
    const arrTime = moment().format('DD-MM-YYYY HH:mm').split(' ');

    const firstLines = [
      {
        caption: `Tanggal     : ${arrTime[0]}        Jam: ${arrTime[1]}`,
        alignment: 'left',
        font: 'regular',
      },
      { caption: ' ', alignment: 'left', font: 'regular' },
      {
        caption: `No resi       : ${payload.awb}`,
        alignment: 'left',
        font: 'bold',
      },
      {
        caption: `Nama kurir    : ${payload.courier_name}`,
        alignment: 'left',
        font: 'regular',
      },
      { caption: ' ', alignment: 'left', font: 'regular' },
      {
        caption: `Nama penerima : ${payload.recipient_name}`,
        alignment: 'left',
        font: 'regular',
      },
      { caption: ' ', alignment: 'left', font: 'regular' },
      { caption: 'Alamat penerima :', alignment: 'left', font: 'regular' },
    ];

    const lastLines = [
      { caption: ' ', alignment: 'left', font: 'regular' },
      {
        caption: `Tipe pembayaran   : ${payload.cod_type}`,
        alignment: 'left',
        font: 'regular',
      },
      {
        caption: `Nilai pembayaran  : Rp. ${currencyFormat},-`,
        alignment: 'left',
        font: 'regular',
      },
      { caption: ' ', alignment: 'left', font: 'regular' },
      { caption: ' ', alignment: 'center', font: 'regular' },
      {
        caption: '(simpan struk ini sebagai bukti)',
        alignment: 'center',
        font: 'bold',
      },
    ];

    if (payload.recipient_address.length) {
      // split with 40 char
      const arrAddress = payload.recipient_address.split(/(.{40})/).filter(O => O);
      for (const item of arrAddress) {
        firstLines.push({
          caption: item,
          alignment: 'left',
          font: 'regular',
        });
      }
    } else {
      firstLines.push({
        caption: ' - ',
        alignment: 'left',
        font: 'regular',
      });
    }

    const data = {
      company: 'SICEPAT',
      logo: 'sicepat-logo',
      trxid,
      amount: payload.cod_value,
      headers: [
        { caption: 'SiCepat Ekspres', alignment: 'Center', font: 'bold' },
        {
          caption: 'Bukti Transaksi COD',
          alignment: 'Center',
          font: 'regular',
        },
        { caption: '', alignment: 'Center', font: 'regular' },
      ],
      footers: [
        { caption: '', alignment: 'Center', font: 'regular' },
        {
          caption: 'Kritik Bantuan dan Saran:',
          alignment: 'Center',
          font: 'regular',
        },
        {
          caption: 'www.sicepat.com',
          alignment: 'Center',
          font: 'regular',
        },
        { caption: 'TERIMA KASIH', alignment: 'Center', font: 'regular' },
      ],
      lines: [...firstLines, ...lastLines],
    };
    return data;
  }
}
