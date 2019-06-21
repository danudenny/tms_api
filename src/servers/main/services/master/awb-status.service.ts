import { Injectable, Logger } from '@nestjs/common';
import { toInteger, isEmpty } from 'lodash';
import { MetaService } from '../../../../shared/services/meta.service';
import { RawQueryService } from '../../../../shared/services/raw-query.service';
import { AwbStatusPayloadVm, AwbStatusFindAllResponseVm } from '../../models/awb-status.vm';

@Injectable()
export class AwbStatusService {

  constructor() {}

  async listData(
    payload: AwbStatusPayloadVm,
    ): Promise<AwbStatusFindAllResponseVm> {
    const page = toInteger(payload.page) || 1;
    const take = toInteger(payload.limit) || 10;
    const search = payload.filters.search;
    const offset = (page - 1) * take;
    const sortBy = isEmpty(payload.sortBy) ? 'awb_status_name' : payload.sortBy;
    const sortDir = isEmpty(payload.sortDir) ? 'ASC' : payload.sortDir;

    // FIXME: change to ORM
    const [query, parameters] = RawQueryService.escapeQueryWithParameters(
      `SELECT
        awb_status_id as "awbStatusId",
        awb_status_name as "awbStatusName",
        awb_status_title as "awbStatusTitle"
      FROM awb_status
      WHERE awb_status_name ILIKE '%${search}%' OR awb_status_title ILIKE '%${search}%'
      ORDER BY ${sortBy} ${sortDir} LIMIT :take OFFSET :offset`,
      { take, offset },
    );

    const [querycount, parameterscount] = RawQueryService.escapeQueryWithParameters(
      `SELECT COUNT (*) FROM awb_status WHERE awb_status_name ILIKE '%${search}%' OR awb_status_title ILIKE '%${search}%'`, {},
    );
    // exec raw query
    const data = await RawQueryService.query(query, parameters);
    const total = await RawQueryService.query(querycount, parameterscount);
    const result = new AwbStatusFindAllResponseVm();
    result.data = data;
    result.paging = MetaService.set(page, take, toInteger(total[0].count));
    return result;
  }
}
