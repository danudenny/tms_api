import { Injectable } from '@nestjs/common';
import { BranchFindAllResponseVm } from '../../models/branch.response.vm';
import { toInteger, isEmpty } from 'lodash';
import { MetaService } from '../../../../shared/services/meta.service';
import { BranchPayloadVm } from '../../models/branch.vm';
import { BaseQueryPayloadVm } from '../../../../shared/models/base-query-payload.vm';

@Injectable()
export class BranchService {

  constructor() {}
  async findBranchName(
    payload: BranchPayloadVm,
  ): Promise<BranchFindAllResponseVm> {
    // params
    const page = toInteger(payload.page) || 1;
    const take = toInteger(payload.limit) || 10;
    const search = payload.filters.search;
    const offset = (page - 1) * take;
    const sortBy = isEmpty(payload.sortBy) ? 'branch_name' : payload.sortBy;
    const sortDir = payload.sortDir === 'asc' ? 'asc' : 'desc'  ;

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
          field: 'branch_name',
          operator: 'like',
          value: search,
        },
      ],
      [
        {
          field: 'branch_code',
          operator: 'like',
          value: search,
        },
      ],
    ];

    // add select field
    const qb = queryPayload.buildQueryBuilder();
    qb.addSelect('branch.branch_id', 'branchId');
    qb.addSelect('branch.branch_name', 'branchName');
    qb.addSelect('branch.branch_code', 'branchCode');
    qb.from('branch', 'branch');

    // exec raw query
    const data = await qb.execute();
    const total = await qb.getCount();
    const result = new BranchFindAllResponseVm();
    result.data = data;
    result.paging = MetaService.set(page, take, total);
    return result;
  }
}
