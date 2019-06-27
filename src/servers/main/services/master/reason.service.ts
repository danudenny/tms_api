import { Injectable } from '@nestjs/common';

import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { MetaService } from '../../../../shared/services/meta.service';
import { ReasonFindAllResponseVm } from '../../models/reason.vm';

@Injectable()
export class ReasonService {
  constructor() {}
  async listData(payload: BaseMetaPayloadVm): Promise<ReasonFindAllResponseVm> {
    // mapping search field and operator default ilike
    payload.globalSearchFields = [
      {
        field: 'reasonCode',
      },
      {
        field: 'reasonName',
      },
    ];

    // add select field
    const qb = payload.buildQueryBuilder();
    qb.addSelect('reason.reason_id', 'reasonId');
    qb.addSelect('reason.reason_name', 'reasonName');
    qb.addSelect('reason.reason_code', 'reasonCode');
    qb.from('reason', 'reason');

    const total = await qb.getCount();

    // exec raw query
    payload.applyPaginationToQueryBuilder(qb);
    const data = await qb.execute();

    const result = new ReasonFindAllResponseVm();
    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }
}
