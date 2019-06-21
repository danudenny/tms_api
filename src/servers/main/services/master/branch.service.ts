import { Injectable, Logger } from '@nestjs/common';
import { BranchFindAllResponseVm } from '../../models/branch.response.vm';
import { toInteger, isEmpty } from 'lodash';
import { MetaService } from '../../../../shared/services/meta.service';
import moment = require('moment');
import { BranchPayloadVm } from '../../models/branch.vm';
import { RawQueryService } from '../../../../shared/services/raw-query.service';
@Injectable()
export class BranchService {

  constructor() {}
  async findBranchName(
    payload: BranchPayloadVm,
    ): Promise<BranchFindAllResponseVm> {
    const page = toInteger(payload.page) || 1;
    const take = toInteger(payload.limit) || 10;
    const search = payload.filters.search;
    const offset = (page - 1) * take;
    const sortBy = isEmpty(payload.sortBy) ? 'branch_name' : payload.sortBy;
    const sortDir = isEmpty(payload.sortDir) ? 'ASC' : payload.sortDir;

    // FIXME: change to ORM
    const [query, parameters] = RawQueryService.escapeQueryWithParameters(
      `SELECT
        branch_id as "branchId",
        branch_name as "branchName",
        branch_code as "branchCode"
      FROM branch
      WHERE branch_name ILIKE '%${search}%' OR branch_code ILIKE '%${search}%'
      ORDER BY ${sortBy} ${sortDir} LIMIT :take OFFSET :offset`,
      { take, offset },
    );

    const [querycount, parameterscount] = RawQueryService.escapeQueryWithParameters(
      `SELECT COUNT (*) FROM branch WHERE branch_name ILIKE '%${search}%' OR branch_code ILIKE '%${search}%'`, {},
    );
    // exec raw query
    const data = await RawQueryService.query(query, parameters);
    const total = await RawQueryService.query(querycount, parameterscount);
    const result = new BranchFindAllResponseVm();
    result.data = data;
    result.paging = MetaService.set(page, take, toInteger(total[0].count));
    return result;
    }
}
