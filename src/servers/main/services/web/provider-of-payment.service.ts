import { createQueryBuilder, Code } from 'typeorm';
import axios from 'axios';
import {ListProviderResponseVm, MobileProviderPaymentDivaResponseVm } from '../../models/payment-provider-response.vm';
import {CodPayment} from '../../../../shared/orm-entity/cod-payment';
import {AuthService} from '../../../../shared/services/auth.service';
import moment = require('moment');
import {MobileProviderPaymentDivaPayloadVm} from '../../models/payment-provider-payload';
import {ConfigService} from '../../../../shared/services/config.service';

export class ProviderOfPaymentService {
  constructor() {
  }

  // Partner GOJEK ============================================================
  private static get odooBaseUrl() {
    return ConfigService.get('odoo.baseUrl');
  }

  private static get headerOdoo() {
    return {
      'auth-key': ConfigService.get('odoo.authKey'),
      'Content-Type': 'application/json',
    };
  }

  static async getListPaymentProvider()
  : Promise<ListProviderResponseVm> {
    const result = new ListProviderResponseVm();
    // GET item korwil
    const qb = createQueryBuilder();
    qb.addSelect('pps.payment_provider_service_id', 'paymentProviderServiceId');
    qb.addSelect('pps.payment_provider_service_name', 'paymentProviderServiceName');
    qb.addSelect('pps.payment_provider_service_link', 'paymentProviderServiceLink');
    qb.addSelect('pps.payment_provider_service_logo', 'paymentProviderServiceLogo');
    qb.from('payment_provider_service', 'pps');
    qb.andWhere('pps.is_deleted = false');
    result.data = await qb.getRawMany();
    return result;
  }

  static async sendPayment(
    payload: MobileProviderPaymentDivaPayloadVm,
  ): Promise<MobileProviderPaymentDivaResponseVm> {
    const result = new MobileProviderPaymentDivaResponseVm();
    const authMeta = AuthService.getAuthData();
    const urlPost = `${this.odooBaseUrl}diva_payment`;
    const jsonData = {
      jsonrpc: '2.0',
      params: {
        air_waybill: payload.awbNumber,
        trx_no: payload.noReference,
      },
    };
    const options = {
      headers: this.headerOdoo,
    };

    try {
      const response = await axios.post(urlPost, jsonData, options);
      const data = response.data;

      if (data.result && data.result.response_code === '00') {
        const codPayment = CodPayment.create({
          awbNumber: payload.awbNumber,
          codValue: payload.totalCodValue,
          codPaymentMethod: payload.codPaymentMethod,
          codPaymentService: payload.codPaymentService,
          note: payload.note,
          noReference: payload.noReference,
          doPodDeliverDetailId: payload.doPodDeliverDetailId,
          userIdCreated: authMeta.userId,
          userIdUpdated: authMeta.userId,
          createdTime: moment().toDate(),
          updatedTime: moment().toDate(),
        });
        CodPayment.insert(codPayment);

        result.message = 'Berhasil Melakukan Transaksi COD';
        result.status = 'success';
      } else {
        result.status = 'error';
        result.message = data.result.response_msg;
      }

      result.data = payload;
      return result;
    } catch (error) {
      result.data = payload;
      result.status = 'error';
      result.message = 'Gagal melakukan transaksi COD';
      return result;
    }
  }
}
