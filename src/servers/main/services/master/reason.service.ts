import { Injectable } from '@nestjs/common';

import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { RepositoryService } from '../../../../shared/services/repository.service';
import { ReasonFindAllResponseVm } from '../../models/reason.vm';

@Injectable()
export class ReasonService {
  async findAllByRequest(payload: BaseMetaPayloadVm): Promise<ReasonFindAllResponseVm> {
    // mapping search field and operator default ilike
    payload.globalSearchFields = [
      {
        field: 'reasonCode',
      },
      {
        field: 'reasonName',
      },
    ];

    const q = RepositoryService.reason.findAllRaw();
    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['reason.reason_id', 'reasonId'],
      ['reason.reason_name', 'reasonName'],
      ['reason.reason_code', 'reasonCode'],
    );
    q.where(e => e.isDeleted, w => w.isFalse());

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new ReasonFindAllResponseVm();
    result.data = data;
    result.buildPaging(payload.page, payload.limit, total);

    return result;
  }
}
