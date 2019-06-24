import { Injectable } from '@nestjs/common';
import { toInteger, isEmpty } from 'lodash';
import { MetaService } from '../../../../shared/services/meta.service';
import { AwbStatusPayloadVm, AwbStatusFindAllResponseVm } from '../../models/awb-status.vm';
import { BaseQueryPayloadVm } from '../../../../shared/models/base-query-payload.vm';

@Injectable()
export class AwbStatusService {

  constructor() {}

  async listData(
    payload: AwbStatusPayloadVm,
  ): Promise<AwbStatusFindAllResponseVm> {
    // params
    const page = toInteger(payload.page) || 1;
    const take = toInteger(payload.limit) || 10;
    const search = payload.filters.search;
    const offset = (page - 1) * take;
    const sortBy = isEmpty(payload.sortBy) ? 'awb_status_name' : payload.sortBy;
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
          field: 'awb_status_name',
          operator: 'like',
          value: search,
        },
      ],
      [
        {
          field: 'awb_status_title',
          operator: 'like',
          value: search,
        },
      ],
    ];

    // add select field
    const qb = queryPayload.buildQueryBuilder();
    qb.addSelect('awb_status.awb_status_id', 'awbStatusId');
    qb.addSelect('awb_status.awb_status_name', 'awbStatusName');
    qb.addSelect('awb_status.awb_status_title', 'awbStatusTitle');
    qb.from('awb_status', 'awb_status');

    // exec raw query
    const data = await qb.execute();
    const total = await qb.getCount();
    const result = new AwbStatusFindAllResponseVm();
    result.data = data;
    result.paging = MetaService.set(page, take, total);
    return result;
  }
}
