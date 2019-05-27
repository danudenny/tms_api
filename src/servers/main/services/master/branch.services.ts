import { Injectable } from '@nestjs/common';
import { BranchFindAllResponseVm } from '../../models/branch.response.vm';
import { toInteger } from 'lodash';
import { MetaService } from '../../../../shared/services/meta.service';
import moment = require('moment');
import { BranchPayloadVm } from '../../models/branch.vm';
import { RawQueryService } from 'src/shared/services/raw-query.service';

@Injectable()
export class BranchService {

  constructor() {}
  async findBranchName(
    payload: BranchPayloadVm
    ): Promise<BranchFindAllResponseVm> {
    const page = toInteger(payload.page) || 1;
    const take = toInteger(payload.limit) || 10;
    const search = payload.filters.search
    const offset = (page - 1) * take;

    const [query, parameters] = RawQueryService.escapeQueryWithParameters(
      `select branch_id as "branchId", branch_name as "branchName",branch_code as "branchCode" from branch where branch_name LIKE '%${search}%' LIMIT :take`,
      { take},
    );

    const [querycount, parameterscount] = RawQueryService.escapeQueryWithParameters(
      `select count (*) from branch where branch_name LIKE '%${search}%'`,
      { },
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
