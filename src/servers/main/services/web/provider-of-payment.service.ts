import { createQueryBuilder } from 'typeorm';
import axios from 'axios';
import {ListProviderResponseVm} from '../../models/payment-provider-response.vm';

export class ProviderOfPaymentService {
  constructor() {
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

//   static async sendPayment() {
//     const urlPost = `http://52.77.199.252:5168/dive_payment`;
//     const jsonData = {
//       jsonrpc: '2.0',
//       params: {
//         air_waybill: 'asasasa',
//         trx_no: 'asasaa',
//       },
//     };
//     const options = {
//       headers: {
//         'auth-key': '5a71a345b4eaa9d23b4d4c745e7785e9',
//         'Content-Type': 'application/json',
//       },
//     };
//     try {
//     const response = await axios.post(urlPost, jsonData, options);
//     console.log(response);
//     return response;
//     } catch (error) {
//       return {
//         status: error.response.status,
//         ...error.response.data,
//       };
//     }
//   }
}
