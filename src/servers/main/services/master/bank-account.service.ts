import { Injectable } from '@nestjs/common';

import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { BankBranch } from '../../../../shared/orm-entity/bank-branch';
import { BankAccountResponseVm } from '../../models/master/bank-account.vm';

@Injectable()
export class BankAccountService {
  constructor() {}

  static async listData(
    payload: BaseMetaPayloadVm,
  ): Promise<BankAccountResponseVm> {
    // mapping search field and operator default ilike
    // payload.globalSearchFields = [
    //   {
    //     field: 'awbStatusName',
    //   },
    //   {
    //     field: 'awbStatusTitle',
    //   },
    // ];
    // if (payload.sortBy === '') {
    //   payload.sortBy = 'updatedTime';
    // }

    const repo = new OrionRepositoryService(BankBranch, 't1');
    const q = repo.findAllRaw();
    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['t1.bank_branch_id', 'bankBranchId'],
      ['t1.bank_branch_name', 'bankBranchName'],
      ['t1.account_number', 'accountNumber'],
      ['t1.address', 'address'],
      ['t2.bank_code', 'bankCode'],
      ['t2.bank_name', 'bankName'],
    );
    q.innerJoin(e => e.bank, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.andWhere(e => e.isDeleted, w => w.isFalse());

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new BankAccountResponseVm();
    result.data = data;
    result.buildPaging(payload.page, payload.limit, total);

    return result;
  }
}
