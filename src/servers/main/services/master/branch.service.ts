import { Injectable } from '@nestjs/common';

import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { RepositoryService } from '../../../../shared/services/repository.service';
import { BranchFindAllResponseVm } from '../../models/branch.response.vm';

@Injectable()
export class BranchService {
  async findAllByRequest(
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

    const q = RepositoryService.branch.findAllRaw();
    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['branch.branch_id', 'branchId'],
      ['branch.branch_name', 'branchName'],
      ['branch.branch_code', 'branchCode'],
    );
    q.andWhere(e => e.isDeleted, w => w.isFalse());

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new BranchFindAllResponseVm();
    result.data = data;

    result.buildPaging(payload.page, payload.limit, total);

    return result;
  }
}
