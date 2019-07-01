import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { AwbTrouble } from '../../../../shared/orm-entity/awb-trouble';
import { MetaService } from '../../../../shared/services/meta.service';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { AwbTroubleResponseVm } from '../../models/awb-trouble-response.vm';

export class WebAwbTroubleService {
  public static async findAllByRequest(payload: BaseMetaPayloadVm) {
    const repository = new OrionRepositoryService(AwbTrouble);
    const q = repository.findAllRaw();

    payload.globalSearchFields = [
      {
        field: 'awbNumber',
      },
    ];

    payload.applyToOrionRepositoryQuery(q, true);

    // TODO: resolve desc, awbTroubleName
    q.selectRaw(
      ['awb_trouble_id', 'awbTroubleId'],
      ['awb_number', 'awbNumber'],
      ['status_resolve_id', 'statusResolveId'],
      ['created_time', 'scanInDateTime'],
      ['description', 'desc'],
      [
        `CASE awb_status_id WHEN 1 THEN 'A' WHEN 2 THEN 'B' ELSE '' END`,
        'awbTroubleName',
      ],
    );

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const response = new AwbTroubleResponseVm();
    response.data = data;
    response.paging = MetaService.set(payload.page, payload.limit, total);

    return response;
  }
}
