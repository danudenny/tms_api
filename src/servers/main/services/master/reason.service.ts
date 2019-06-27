import { Injectable } from '@nestjs/common';
import { MetaService } from '../../../../shared/services/meta.service';
import { ReasonFindAllResponseVm } from '../../models/reason.vm';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';

@Injectable()
export class ReasonService {

  constructor() {}
  async listData(
    payload: BaseMetaPayloadVm,
  ): Promise<ReasonFindAllResponseVm> {
    // mapping search field and operator default ilike
    payload.searchFields = [
      {
        field: 'reasonCode',
      },
      {
        field: 'reasonName',
      },
    ];

    // add field for filter and transform to snake case
    payload.setFieldResolverMapAsSnakeCase(['reasonCode', 'reasonName']);

    // add select field
    const qb = payload.buildQueryBuilder();
    qb.addSelect('reason.reason_id', 'reasonId');
    qb.addSelect('reason.reason_name', 'reasonName');
    qb.addSelect('reason.reason_code', 'reasonCode');
    qb.from('reason', 'reason');

    // exec raw query
    payload.applyPaginationToQueryBuilder(qb);
    const total = await qb.getCount();
    const data = await qb.execute();

    const result = new ReasonFindAllResponseVm();
    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }
}
