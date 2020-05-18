import { createQueryBuilder } from 'typeorm';
import {ListProviderResponseVm } from '../../models/payment-provider-response.vm';
import {ConfigService} from '../../../../shared/services/config.service';

export class ProviderOfPaymentService {
  constructor() {
  }

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
}
