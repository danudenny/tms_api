import { Injectable, Logger } from '@nestjs/common';
import { toInteger, isEmpty } from 'lodash';
import { MetaService } from '../../../../shared/services/meta.service';
import { RawQueryService } from '../../../../shared/services/raw-query.service';
import { AwbStatusPayloadVm, AwbStatusFindAllResponseVm } from '../../models/awb-status.vm';
import { ReasonPayloadVm, ReasonFindAllResponseVm } from '../../models/reason.vm';

@Injectable()
export class ReasonService {

  constructor() {}

  async listData(
    payload: ReasonPayloadVm,
    ): Promise<ReasonFindAllResponseVm> {
    const page = toInteger(payload.page) || 1;
    const take = toInteger(payload.limit) || 10;
    const search = payload.filters.search;
    const offset = (page - 1) * take;
    const sortBy = isEmpty(payload.sortBy) ? 'reason_name' : payload.sortBy;
    const sortDir = isEmpty(payload.sortDir) ? 'ASC' : payload.sortDir;

    // FIXME: change to ORM
    const [query, parameters] = RawQueryService.escapeQueryWithParameters(
      `SELECT
        reason_id as "reasonId",
        reason_name as "reasonName",
        reason_code as "reasonCode"
      FROM reason
      WHERE reason_name ILIKE '%${search}%' OR reason_code ILIKE '%${search}%'
      ORDER BY ${sortBy} ${sortDir} LIMIT :take OFFSET :offset`,
      { take, offset },
    );

    const [querycount, parameterscount] = RawQueryService.escapeQueryWithParameters(
      `SELECT COUNT (*) FROM reason WHERE reason_name ILIKE '%${search}%' OR reason_code ILIKE '%${search}%'`, {},
    );
    // exec raw query
    const data = await RawQueryService.query(query, parameters);
    const total = await RawQueryService.query(querycount, parameterscount);
    const result = new ReasonFindAllResponseVm();
    result.data = data;
    result.paging = MetaService.set(page, take, toInteger(total[0].count));
    return result;
  }
}
