import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { AwbTrouble } from '../../../../shared/orm-entity/awb-trouble';
import { MetaService } from '../../../../shared/services/meta.service';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { AwbTroubleResponseVm } from '../../models/awb-trouble-response.vm';

export class WebAwbTroubleService {
  public static async findAllByRequest(payload: BaseMetaPayloadVm) {
    payload.fieldResolverMap['podScanInDateTime'] = 'created_time';
    payload.fieldResolverMap['awbNumber'] = 'awb_number';

    payload.globalSearchFields = [
      {
        field: 'awbNumber',
      },
    ];

    const repository = new OrionRepositoryService(AwbTrouble);
    const q = repository.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['awb_trouble_id', 'awbTroubleId'],
      ['awb_number', 'awbNumber'],
      ['awb_trouble_status_id', 'awbTroubleStatusId'],
      ['created_time', 'scanInDateTime'],
      ['description_solution', 'descriptionSolution'],
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
