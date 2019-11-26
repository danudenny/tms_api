import moment = require('moment');
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { AwbItemAttr } from '../../../../shared/orm-entity/awb-item-attr';
import { AwbStatusGroupItem } from '../../../../shared/orm-entity/awb-status-group-item';
import { AuthService } from '../../../../shared/services/auth.service';
import { AwbItem } from '../../../../shared/orm-entity/awb-item';
import { AwbAttr } from '../../../../shared/orm-entity/awb-attr';
import { createQueryBuilder } from 'typeorm';
import { AwbDeliverManualVm } from '../../models/web-awb-deliver.vm';

export class AwbService {

  public static async validAwbNumber(awbNumber: string): Promise<AwbItemAttr> {
    const awbRepository = new OrionRepositoryService(AwbItemAttr);
    const q = awbRepository.findOne();
    // Manage relation (default inner join)
    q.leftJoin(e => e.branchLast);
    q.leftJoin(e => e.bagItemLast);

    q.select({
      awbItemAttrId: true,
      awbStatusIdLast: true,
      awbHistoryIdLast: true,
      awbItemId: true,
      awbItem: {
        awbItemId: true,
        awbId: true,
      },
      awbId: true,
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
    q.take(1);
    return await q.exec();
  }

  public static async validAwbBagNumber(awbNumber: string): Promise<AwbItemAttr> {
    const awbRepository = new OrionRepositoryService(AwbItemAttr);
    const q = awbRepository.findOne();
    // Manage relation (default inner join)
    q.leftJoin(e => e.branchLast);
    q.leftJoin(e => e.bagItemLast);

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
    q.take(1);
    return await q.exec();
  }

  public static async getDataPickupRequest(awbNumber: string): Promise<any> {
    const qb = createQueryBuilder();
    qb.addSelect('awb.awb_id', 'awbId');
    qb.addSelect('awb.awb_number', 'awbNumber');
    qb.addSelect('awb.customer_account_id', 'customerAccountId');
    qb.addSelect('prd.work_order_id_last', 'workOrderId');
    qb.addSelect('COALESCE(prd.shipper_name, ca.customer_account_name)', 'consigneeName');
    qb.addSelect('prd.shipper_phone', 'consigneePhone');
    qb.addSelect('prd.shipper_address', 'consigneeAddress');
    qb.addSelect('prd.shipper_zip', 'consigneeZip');
    qb.addSelect('p.province_id', 'provinceId');
    qb.addSelect('p.province_code', 'provinceCode');
    qb.addSelect('p.province_Name', 'provinceName');
    qb.addSelect('c.city_id', 'cityId');
    qb.addSelect('c.city_code', 'cityCode');
    qb.addSelect('c.city_name', 'cityName');
    qb.addSelect('d.district_id', 'districtId');
    qb.addSelect('d.district_code', 'districtCode');
    qb.addSelect('d.district_Name', 'districtName');
    qb.from('awb', 'awb');
    qb.innerJoin(
      'awb_item',
      'ai',
      'awb.awb_id = ai.awb_id AND ai.is_deleted = false',
    );
    qb.leftJoin(
      'customer_account',
      'ca',
      'ca.customer_account_id = awb.customer_account_id and ca.is_deleted = false',
    );
    qb.leftJoin(
      'pickup_request_detail',
      'prd',
      'prd.awb_item_id = ai.awb_item_id and prd.is_deleted = false',
    );
    qb.leftJoin(
      'work_order',
      'wo',
      'prd.work_order_id_last = wo.work_order_id AND wo.is_deleted = false',
    );
    qb.leftJoin(
      'branch',
      'b',
      'wo.branch_id_assigned = b.branch_id AND b.is_deleted = false',
    );
    qb.leftJoin(
      'district',
      'd',
      'b.district_id = d.district_id AND d.is_deleted = false',
    );
    qb.leftJoin(
      'city',
      'c',
      'c.city_id = d.city_id AND c.is_deleted = false',
    );
    qb.leftJoin(
      'province',
      'p',
      'p.province_id = d.province_id AND p.is_deleted = false',
    );
    qb.where('awb.awb_number = :awbNumber', { awbNumber });
    qb.andWhere('awb.is_deleted = false');
    return await qb.getRawOne();
  }

  public static async getDataDeliver(awbNumber: string, userIdDriver: number): Promise<AwbDeliverManualVm> {
    const qb = createQueryBuilder();
    qb.addSelect('aia.awb_item_id', 'awbItemId');
    qb.addSelect('aia.awb_number', 'awbNumber');
    qb.addSelect('dpdd.do_pod_deliver_detail_id', 'doPodDeliverDetailId');
    qb.addSelect('dpd.do_pod_deliver_id', 'doPodDeliverId');
    qb.addSelect('dpdd.awb_status_id_last', 'awbStatusId');
    qb.from('awb_item_attr', 'aia');
    qb.innerJoin(
      'do_pod_deliver_detail',
      'dpdd',
      'aia.awb_item_id = dpdd.awb_item_id AND dpdd.awb_status_id_last = 14000 AND aia.is_deleted = false',
    );
    qb.innerJoin(
      'do_pod_deliver',
      'dpd',
      'dpdd.do_pod_deliver_id = dpd.do_pod_deliver_id AND dpd.is_deleted = false',
    );
    qb.where('aia.awb_number = :awbNumber AND dpd.user_id_driver = :userIdDriver', { awbNumber, userIdDriver });
    return await qb.getRawOne();
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

    q.where(e => e.awbStatusId, w => w.equals(Number(awbStatusId)));
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
      awbItemAttr.awbHistoryDateLast = timeNow;
      awbItemAttr.updatedTime = timeNow;
      await AwbItemAttr.save(awbItemAttr);
    }

    // const awbItem = await AwbItem.findOne({
    //   where: {
    //     awbItemId,
    //     isDeleted: false,
    //   },
    // });
    // if (awbItem) {
    //   // Update awb_attr  semua field dengan suffix _last
    //   const awbAttr = await AwbAttr.findOne({
    //     where: {
    //       awbId: awbItem.awbId,
    //     },
    //   });
    //   if (awbAttr) {
    //     // TODO: how to update data??
    //     // awbAttr.awbHistoryIdLast;
    //     // awbAttr.awbStatusIdLastPublic;
    //     await AwbAttr.update(awbAttr.awbAttrId, {
    //       branchIdNext,
    //       awbStatusIdLast: status,
    //       branchIdLast: permissonPayload.branchId,
    //       awbhistoryDateLast: timeNow,
    //       updatedTime: timeNow,
    //     });
    //   }
    // }
  }

}
