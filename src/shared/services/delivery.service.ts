import { OrionRepositoryService } from './orion-repository.service';
import { AwbItemAttr } from '../orm-entity/awb-item-attr';
import { AwbStatusGroupItem } from '../orm-entity/awb-status-group-item';

export class DeliveryService {

  public static async validAwbNumber(awbNumber: string): Promise<AwbItemAttr> {
    // NOTE: raw query
    // SELECT ai.awb_status_id_last, ai.awb_item_id, br.branch_code, br.branch_name
    // FROM awb_item_attr ai
    // INNER JOIN branch br ON ai.branch_id_last = br.branch_id
    // WHERE ai.awb_number = :awb_number

    // find data to awb where awbNumber and awb status not cancel
    const awbRepository = new OrionRepositoryService(AwbItemAttr);
    const q = awbRepository.findOne();
    // Manage relation (default inner join)
    q.innerJoin(e => e.branchLast);

    q.select({
      awbItemAttrId: true,
      awbStatusIdLast: true,
      awbItemId: true,
      awbNumber: true,
      branchIdLast: true,
      branchLast: {
        branchId: true,
        branchCode: true,
        branchName: true,
      },
    });
    // q2.where(e => e.bagItems.bagId, w => w.equals('421862'));
    q.where(e => e.awbNumber, w => w.equals(awbNumber));
    return await q.exec();
  }

  public static async awbStatusGroup(awbStatusId: number): Promise<string> {
    const awbRepository = new OrionRepositoryService(AwbStatusGroupItem);
    const q = awbRepository.findOne();
    // Manage relation (default inner join)
    q.innerJoin(e => e.awbStatusGroup);

    q.select({
      awbStatusGroupItemId: true,
      awbStatusGroup: {
        awbStatusGroupId: true,
        code: true,
      },
    });

    q.where(e => e.awbStatusId, w => w.equals(awbStatusId));
    const result = await q.exec();
    return result.awbStatusGroup.code;
  }
}
