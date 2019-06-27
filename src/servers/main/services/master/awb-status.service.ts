import { Injectable } from '@nestjs/common';
import { MetaService } from '../../../../shared/services/meta.service';
import { BaseMetaPayloadVm } from 'src/shared/models/base-meta-payload.vm';
import { AwbStatusFindAllResponseVm } from '../../models/awb-status.vm';

@Injectable()
export class AwbStatusService {

  constructor() {}

  async listData(
    payload: BaseMetaPayloadVm,
  ): Promise<AwbStatusFindAllResponseVm> {
    // mapping search field and operator default ilike
    payload.searchFields = [
      {
        field: 'awbStatusName',
      },
      {
        field: 'awbStatusTitle',
      },
    ];

    // add field for filter and transform to snake case
    payload.setFieldResolverMapAsSnakeCase(['awbStatusName', 'awbStatusTitle']);

    // add select field
    const qb = payload.buildQueryBuilder();
    qb.addSelect('awb_status.awb_status_id', 'awbStatusId');
    qb.addSelect('awb_status.awb_status_name', 'awbStatusName');
    qb.addSelect('awb_status.awb_status_title', 'awbStatusTitle');
    qb.from('awb_status', 'awb_status');

    // exec raw query
    payload.applyPaginationToQueryBuilder(qb);
    const total = await qb.getCount();
    const data = await qb.execute();

    const result = new AwbStatusFindAllResponseVm();
    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }
}
