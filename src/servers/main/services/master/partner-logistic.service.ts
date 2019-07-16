import { Injectable } from '@nestjs/common';

import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { RepositoryService } from '../../../../shared/services/repository.service';
import { PartnerLogisticFindAllResponseVm } from '../../models/partner-logistic.vm';

@Injectable()
export class PartnerLogisticService {
  async findAllByRequest(
    payload: BaseMetaPayloadVm,
  ): Promise<PartnerLogisticFindAllResponseVm> {
    // mapping search field and operator default ilike
    payload.globalSearchFields = [
      {
        field: 'partnerLogisticName',
      },
      {
        field: 'partnerLogisticEmail',
      },
    ];

    const q = RepositoryService.partnerLogistic.findAllRaw();
    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['partner_logistic.partner_logistic_id', 'partnerLogisticId'],
      ['partner_logistic.partner_logistic_name', 'partnerLogisticName'],
      ['partner_logistic.partner_logistic_email', 'partnerLogisticEmail'],
    );

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new PartnerLogisticFindAllResponseVm();
    result.data = data;
    result.buildPaging(payload.page, payload.limit, total);

    return result;
  }
}
