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
      branchIdNext: true,
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

  public static async updateAwbAttr(awbItemId: number, branchIdNext: number, status: number) {
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
      awbItemAttr.branchIdNext = branchIdNext;
      awbItemAttr.historyDateLast = timeNow;
      awbItemAttr.updatedTime = timeNow;
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
      awbAttr.branchIdLast = permissonPayload.branchId;
      awbAttr.branchIdNext = branchIdNext;
      awbAttr.historyDateLast = timeNow;
      awbAttr.updatedTime = timeNow;
      await AwbAttr.save(awbAttr);
    }
  }

  public static async validBagNumber(bagNumberSeq: string): Promise<BagItem> {
    const bagNumber: string = bagNumberSeq.substring(0, 7);
    const seqNumber: number = Number(bagNumberSeq.substring(7, 10));

    const bagRepository = new OrionRepositoryService(BagItem);
    const q = bagRepository.findOne();
    // Manage relation (default inner join)
    q.innerJoin(e => e.bag, null, join => join.andWhere(e => e.isDeleted, w => w.isFalse()));

    q.select({
      bagItemId: true,
      bagItemStatusIdLast: true,
      branchIdLast: true,
      bagSeq: true,
      bag: {
        representativeIdTo: true,
        refRepresentativeCode: true,
        bagId: true,
        bagNumber: true,
      },
    });
    q.where(e => e.bag.bagNumber, w => w.equals(bagNumber));
    q.andWhere(e => e.bagSeq, w => w.equals(seqNumber));
    q.andWhere(e => e.isDeleted, w => w.isFalse());
    return await q.exec();
  }
}
