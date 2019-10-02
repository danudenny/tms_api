import { Injectable } from '@nestjs/common';

import { AwbStatusFindAllResponseVm } from '../../models/awb-status.vm';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { RepositoryService } from '../../../../shared/services/repository.service';

@Injectable()
export class AwbStatusService {
  constructor() {}

  async listData(
    payload: BaseMetaPayloadVm,
  ): Promise<AwbStatusFindAllResponseVm> {
    // mapping search field and operator default ilike
    payload.globalSearchFields = [
      {
        field: 'awbStatusName',
      },
      {
        field: 'awbStatusTitle',
      },
    ];

    const q = RepositoryService.awbStatus.findAllRaw();
    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['awb_status.awb_status_id', 'awbStatusId'],
      ['awb_status.awb_status_name', 'awbStatusName'],
      ['awb_status.awb_status_title', 'awbStatusTitle'],
    );
    q.andWhere(e => e.isDeleted, w => w.isFalse());

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new AwbStatusFindAllResponseVm();
    result.data = data;
    result.buildPaging(payload.page, payload.limit, total);

    return result;
  }
}
