import { Injectable, Logger } from '@nestjs/common';
import { toInteger, isEmpty } from 'lodash';
import { MetaService } from '../../../../shared/services/meta.service';
import { RawQueryService } from '../../../../shared/services/raw-query.service';
import { PartnerLogisticPayloadVm, PartnerLogisticFindAllResponseVm } from '../../models/partner-logistic.vm';

@Injectable()
export class PartnerLogisticService {

  constructor() { }

  async listData(
    payload: PartnerLogisticPayloadVm,
  ): Promise<PartnerLogisticFindAllResponseVm> {
    const page = toInteger(payload.page) || 1;
    const take = toInteger(payload.limit) || 10;
    const search = payload.filters.search;
    const offset = (page - 1) * take;
    const sortBy = isEmpty(payload.sortBy) ? 'partner_logistic_name' : payload.sortBy;
    const sortDir = isEmpty(payload.sortDir) ? 'ASC' : payload.sortDir;

    // FIXME: change to ORM
    const [query, parameters] = RawQueryService.escapeQueryWithParameters(
      `SELECT
        partner_logistic_id as "partnerLogisticId",
        partner_logistic_name as "partnerLogisticName",
        partner_logistic_email as "partnerLogisticEmail"
      FROM partner_logistic
      WHERE partner_logistic_name ILIKE '%${search}%'
      ORDER BY ${sortBy} ${sortDir} LIMIT :take OFFSET :offset`,
      { take, offset },
    );

    const [querycount, parameterscount] = RawQueryService.escapeQueryWithParameters(
      `SELECT COUNT (*) FROM partner_logistic WHERE partner_logistic_name ILIKE '%${search}%'`, {},
    );
    // exec raw query
    const data = await RawQueryService.query(query, parameters);
    const total = await RawQueryService.query(querycount, parameterscount);
    const result = new PartnerLogisticFindAllResponseVm();
    result.data = data;
    result.paging = MetaService.set(page, take, toInteger(total[0].count));
    return result;
  }
}
