import { Injectable } from '@nestjs/common';
import { MetaService } from '../../../../shared/services/meta.service';
import { PartnerLogisticFindAllResponseVm } from '../../models/partner-logistic.vm';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';

@Injectable()
export class PartnerLogisticService {

  constructor() { }
  async listData(
    payload: BaseMetaPayloadVm,
  ): Promise<PartnerLogisticFindAllResponseVm> {
    // mapping search field and operator default ilike
    payload.searchFields = [
      {
        field: 'partnerLogisticName',
      },
      {
        field: 'partnerLogisticEmail',
      },
    ];

    // add field for filter and transform to snake case
    payload.setFieldResolverMapAsSnakeCase(['partnerLogisticName', 'partnerLogisticEmail']);

    // add select field
    const qb = payload.buildQueryBuilder();
    qb.addSelect('partner_logistic.partner_logistic_id', 'partnerLogisticId');
    qb.addSelect('partner_logistic.partner_logistic_name', 'partnerLogisticName');
    qb.addSelect('partner_logistic.partner_logistic_email', 'partnerLogisticEmail');
    qb.from('partner_logistic', 'partner_logistic');

    // exec raw query
    payload.applyPaginationToQueryBuilder(qb);
    const total = await qb.getCount();
    const data = await qb.execute();

    const result = new PartnerLogisticFindAllResponseVm();
    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }
}
