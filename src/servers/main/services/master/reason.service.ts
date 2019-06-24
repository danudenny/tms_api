import { Injectable } from '@nestjs/common';
import { toInteger, isEmpty } from 'lodash';
import { MetaService } from '../../../../shared/services/meta.service';
import { ReasonPayloadVm, ReasonFindAllResponseVm } from '../../models/reason.vm';
import { BaseQueryPayloadVm } from '../../../../shared/models/base-query-payload.vm';

@Injectable()
export class ReasonService {

  constructor() {}
  async listData(
    payload: ReasonPayloadVm,
  ): Promise<ReasonFindAllResponseVm> {
    // params
    const page = toInteger(payload.page) || 1;
    const take = toInteger(payload.limit) || 10;
    const search = payload.filters.search;
    const offset = (page - 1) * take;
    const sortBy = isEmpty(payload.sortBy) ? 'reason_name' : payload.sortBy;
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
          field: 'reason_name',
          operator: 'like',
          value: search,
        },
      ],
      [
        {
          field: 'reason_code',
          operator: 'like',
          value: search,
        },
      ],
    ];

    // add select field
    const qb = queryPayload.buildQueryBuilder();
    qb.addSelect('reason.reason_id', 'reasonId');
    qb.addSelect('reason.reason_name', 'reasonName');
    qb.addSelect('reason.reason_code', 'reasonCode');
    qb.from('reason', 'reason');

    // exec raw query
    const data = await qb.execute();
    const total = await qb.getCount();
    const result = new ReasonFindAllResponseVm();
    result.data = data;
    result.paging = MetaService.set(page, take, total);
    return result;
  }
}
