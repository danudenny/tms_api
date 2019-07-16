import { OrionRepositoryService } from './orion-repository.service';
import { AwbItemAttr } from '../orm-entity/awb-item-attr';
import { AwbStatusGroupItem } from '../orm-entity/awb-status-group-item';
import { AuthService } from './auth.service';
import { AwbAttr } from '../orm-entity/awb-attr';
import { AwbItem } from '../orm-entity/awb-item';
import { BagItem } from '../orm-entity/bag-item';
import moment = require('moment');

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

  public static async updateAwbAttr(awbItemId: number, status: number) {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    const timeNow = moment().toDate();

    // TODO: table awb attr and awb item attr
    // Update awb_item_attr  semua field dengan suffix _last

    const awbItemAttr = await AwbItemAttr.findOne({
      where: {
        awbItemId,
      },
    });
    if (awbItemAttr) {
      // TODO: how to update data??
      // awbItemAttr.awbHistoryIdLast;
      // awbItemAttr.awbStatusIdLastPublic;
      awbItemAttr.awbStatusIdLast = status;
      awbItemAttr.userIdLast = authMeta.userId;
      awbItemAttr.branchIdLast = permissonPayload.branchId;
      awbItemAttr.historyDateLast = timeNow;
      awbItemAttr.updateTime = timeNow;
      await AwbItemAttr.save(awbItemAttr);
    }

    const awbItem = await AwbItem.findOne({
      where: {
        awbItemId,
        isDeleted: false,
      },
    });
    if (awbItem) {
      // Update awb_attr  semua field dengan suffix _last
      const awbAttr = await AwbAttr.findOne({
        where: {
          awbId: awbItem.awbId,
        },
      });

      // TODO: how to update data??
      // awbAttr.awbHistoryIdLast;
      // awbAttr.awbStatusIdLastPublic;
      awbAttr.awbStatusIdLast = status;
      awbItemAttr.branchIdLast = permissonPayload.branchId;
      awbItemAttr.historyDateLast = timeNow;
      awbAttr.updateTime = timeNow;
      await AwbAttr.save(awbAttr);
    }
  }

  public static async validBagNumber(bagNumberSeq: string): Promise<BagItem> {
    const bagNumber: string = bagNumberSeq.substring(0, 7);
    const seqNumber: number = Number(bagNumberSeq.substring(7, 10));
    // NOTE: raw query
    // SELECT bag_item_status_id, bag_item_id, branch_id_last
    // FROM bag_item bia
    // INNER JOIN bag b ON b.bag_id = bia.bag_id AND b.is_deleted = false
    // WHERE b.bag_number = [bag_number] AND bia.bag_seq = [bag_seq] AND bia.is_deleted = false

    const bagRepository = new OrionRepositoryService(BagItem);
    const q = bagRepository.findOne();
    // Manage relation (default inner join)
    q.innerJoin(e => e.bag);

    q.select({
      bagItemId: true,
      bagItemStatusIdLast: true,
      branchIdLast: true,
      bagSeq: true,
      bag: {
        bagId: true,
        bagNumber: true,
      },
    });
    q.where(e => e.bag.bagNumber, w => w.equals(bagNumber));
    q.andWhere(e => e.bagSeq, w => w.equals(seqNumber));
    return await q.exec();
  }
}
