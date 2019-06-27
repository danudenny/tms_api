import { Injectable } from '@nestjs/common';

import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { MetaService } from '../../../../shared/services/meta.service';
import { BranchFindAllResponseVm } from '../../models/branch.response.vm';

@Injectable()
export class BranchService {
  constructor() {}
  async findBranchName(
    payload: BaseMetaPayloadVm,
  ): Promise<BranchFindAllResponseVm> {
    // mapping search field and operator default ilike
    payload.globalSearchFields = [
      {
        field: 'branchCode',
      },
      {
        field: 'branchName',
      },
    ];

    // add select field
    const qb = payload.buildQueryBuilder();
    qb.addSelect('branch.branch_id', 'branchId');
    qb.addSelect('branch.branch_name', 'branchName');
    qb.addSelect('branch.branch_code', 'branchCode');
    qb.from('branch', 'branch');

    const total = await qb.getCount();

    // exec raw query
    payload.applyPaginationToQueryBuilder(qb);
    const data = await qb.execute();

    const result = new BranchFindAllResponseVm();
    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }
}
