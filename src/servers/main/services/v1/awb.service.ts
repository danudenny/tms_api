import moment = require('moment');
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { AwbItemAttr } from '../../../../shared/orm-entity/awb-item-attr';
import { AwbStatusGroupItem } from '../../../../shared/orm-entity/awb-status-group-item';
import { AuthService } from '../../../../shared/services/auth.service';
import { AwbItem } from '../../../../shared/orm-entity/awb-item';
import { AwbAttr } from '../../../../shared/orm-entity/awb-attr';

export class AwbService {

  public static async validAwbNumber(awbNumber: string): Promise<AwbItemAttr> {
    const awbRepository = new OrionRepositoryService(AwbItemAttr);
    const q = awbRepository.findOne();
    // Manage relation (default inner join)
    q.leftJoin(e => e.branchLast);

    q.select({
      awbItemAttrId: true,
      awbStatusIdLast: true,
      awbItemId: true,
      awbItem: {
        awbItemId: true,
        awbId: true,
      },
      awbNumber: true,
      isPackageCombined: true,
      bagItemIdLast: true,
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

  public static async validAwbBagNumber(awbNumber: string): Promise<AwbItemAttr> {
    const awbRepository = new OrionRepositoryService(AwbItemAttr);
    const q = awbRepository.findOne();
    // Manage relation (default inner join)
    q.leftJoin(e => e.branchLast);

    q.select({
      awbItemAttrId: true,
      awbStatusIdLast: true,
      awbItemId: true,
      awbItem: {
        awbItemId: true,
        awbId: true,
      },
      awbNumber: true,
      isPackageCombined: true,
      bagItemIdLast: true,
      bagItemLast: {
        bagItemId: true,
        bagId: true,
      },
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
    return result ? result.awbStatusGroup.code : 'NoGroup';
  }

  public static async updateAwbAttr(
    awbItemId: number,
    status: number,
    branchIdNext: number = null,
  ) {
    // TODO: fix data user id last (from session login or params mobile sync)
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
      if (branchIdNext) {
        awbItemAttr.branchIdNext = branchIdNext;
      }
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

}
