import { Injectable } from '@nestjs/common';
import { toInteger, isEmpty } from 'lodash';
import { MetaService } from '../../../../shared/services/meta.service';
import { PartnerLogisticPayloadVm, PartnerLogisticFindAllResponseVm } from '../../models/partner-logistic.vm';
import { BaseQueryPayloadVm } from '../../../../shared/models/base-query-payload.vm';

@Injectable()
export class PartnerLogisticService {

  constructor() { }
  async listData(
    payload: PartnerLogisticPayloadVm,
  ): Promise<PartnerLogisticFindAllResponseVm> {
    // params
    const page = toInteger(payload.page) || 1;
    const take = toInteger(payload.limit) || 10;
    const search = payload.filters.search;
    const offset = (page - 1) * take;
    const sortBy = isEmpty(payload.sortBy) ? 'partner_logistic_name' : payload.sortBy;
    const sortDir = payload.sortDir === 'asc' ? 'asc' : 'desc';

    // NOTE: query with ORM
    const queryPayload = new BaseQueryPayloadVm();
    // add pagination
    queryPayload.take = take;
    queryPayload.skip = offset;
    // add sorting data
    queryPayload.sort = [
      {
        field: sortBy,
        dir: sortDir,
      },
    ];
    // add filter
    queryPayload.filter = [
      [
        {
          field: 'partner_logistic_name',
          operator: 'like',
          value: search,
        },
      ],
    ];

    // add select field
    const qb = queryPayload.buildQueryBuilder();
    qb.addSelect('partner_logistic.partner_logistic_id', 'partnerLogisticId');
    qb.addSelect('partner_logistic.partner_logistic_name', 'partnerLogisticName');
    qb.addSelect('partner_logistic.partner_logistic_email', 'partnerLogisticEmail');
    qb.from('partner_logistic', 'partner_logistic');

    // exec raw query
    const data = await qb.execute();
    const total = await qb.getCount();
    const result = new PartnerLogisticFindAllResponseVm();
    result.data = data;
    result.paging = MetaService.set(page, take, toInteger(total[0].count));
    return result;
  }
}
