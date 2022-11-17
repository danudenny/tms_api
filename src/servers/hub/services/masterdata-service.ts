import { Injectable } from '@nestjs/common';

import { BaseMetaPayloadVm } from '../../../shared/models/base-meta-payload.vm';
import { DoSortationStatus } from '../../../shared/orm-entity/do-sortation-status';
import { OrionRepositoryService } from '../../../shared/services/orion-repository.service';
import { DoSortationStatusResponseVm } from '../models/masterdata-payload.vm';

@Injectable()
export class SortationMasterdataService {
  public async getSortationStatus(
    payload: BaseMetaPayloadVm,
  ): Promise<DoSortationStatusResponseVm> {
    const repo = new OrionRepositoryService(DoSortationStatus, 'dss');
    const q = repo.findAll();
    payload.globalSearchFields = [{ field: 'doSortationStatusTitle' }];
    payload.applyToOrionRepositoryQuery(q, true);
    q.select({
      doSortationStatusId: true,
      doSortationStatusTitle: true,
    }).andWhere(e => e.isDeleted, w => w.isFalse());

    const [statuses, count] = await Promise.all([
      q.exec(),
      q.countWithoutTakeAndSkip(),
    ]);

    const result = new DoSortationStatusResponseVm();
    result.data = statuses;
    result.buildPagingWithPayload(payload, count);

    return result;
  }
}
