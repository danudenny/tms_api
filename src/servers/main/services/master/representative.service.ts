import { Injectable } from '@nestjs/common';

import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { RepositoryService } from '../../../../shared/services/repository.service';
import { RepresentativeFindAllResponseVm } from '../../models/representative-response.vm';

@Injectable()
export class RepresentativeService {
  async findAllByRequest(
    payload: BaseMetaPayloadVm,
  ): Promise<RepresentativeFindAllResponseVm> {
    // mapping search field and operator default ilike
    payload.globalSearchFields = [
      {
        field: 'representativeCode',
      },
      {
        field: 'representativeName',
      },
    ];

    const q = RepositoryService.representative.findAllRaw();
    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['representative.representative_id', 'representativeId'],
      ['representative.representative_name', 'representativeName'],
      ['representative.representative_code', 'representativeCode'],
    );

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new RepresentativeFindAllResponseVm();
    result.data = data;
    result.buildPaging(payload.page, payload.limit, total);

    return result;
  }
}
