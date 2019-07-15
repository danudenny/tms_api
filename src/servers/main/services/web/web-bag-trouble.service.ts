import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { AwbTrouble } from '../../../../shared/orm-entity/awb-trouble';
import { MetaService } from '../../../../shared/services/meta.service';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { BagTroubleResponseVm } from '../../models/bag-trouble-response.vm';

export class WebBagTroubleService {
  public static async findAllByRequest(payload: BaseMetaPayloadVm) {
    const repository = new OrionRepositoryService(AwbTrouble); // FIXME: Change AwbTrouble to BagTrouble
    const q = repository.findAllRaw();

    payload.globalSearchFields = [
      {
        field: 'bagNumber',
      },
    ];

    payload.applyToOrionRepositoryQuery(q, true);

    // TODO: resolve desc, bagTroubleName
    q.selectRaw(
      ['bag_trouble_id', 'bagTroubleId'],
      ['bag_number', 'bagNumber'],
      ['status_resolve_id', 'statusResolveId'],
      ['created_time', 'scanInDateTime'],
      ['description', 'descriptionSolution'],
      [
        `CASE bag_status_id WHEN 1 THEN 'A' WHEN 2 THEN 'B' ELSE '' END`,
        'bagTroubleName',
      ],
    );

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const response = new BagTroubleResponseVm();
    response.data = data;
    response.paging = MetaService.set(payload.page, payload.limit, total);

    return response;
  }
}
