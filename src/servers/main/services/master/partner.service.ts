import { Injectable } from '@nestjs/common';

import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { RepositoryService } from '../../../../shared/services/repository.service';
import { PartnerFindAllResponseVm } from '../../models/partner.vm';

@Injectable()
export class PartnerService {
  static async findAllByRequest(
    payload: BaseMetaPayloadVm,
  ): Promise<PartnerFindAllResponseVm> {
    // mapping search field and operator default ilike
    payload.globalSearchFields = [
      {
        field: 'partnerName',
      },
    ];

    payload.fieldResolverMap['partnerName'] = 'partner_name';

    const q = RepositoryService.partner.findAllRaw();
    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['partner_id', 'partnerId'],
      ['partner_name', 'partnerName'],
    );
    q.andWhere(e => e.isDeleted, w => w.isFalse());

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new PartnerFindAllResponseVm();
    result.data = data;
    result.buildPaging(payload.page, payload.limit, total);

    return result;
  }
}
