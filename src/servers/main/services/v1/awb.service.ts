import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { AwbItemAttr } from '../../../../shared/orm-entity/awb-item-attr';
import { AwbStatusGroupItem } from '../../../../shared/orm-entity/awb-status-group-item';
import { createQueryBuilder } from 'typeorm';
import { AwbDeliverManualVm } from '../../models/web-awb-deliver.vm';
import { AwbHistory } from '../../../../shared/orm-entity/awb-history';
import { AWB_STATUS } from '../../../../shared/constants/awb-status.constant';
import { RawQueryService } from '../../../../shared/services/raw-query.service';
import { In } from 'typeorm';
import { of } from 'rxjs';
import { includes } from 'lodash';
import { AwbStatus } from 'src/shared/orm-entity/awb-status';
import { hashmap } from 'aws-sdk/clients/glacier';

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
        weightReal: true,
        weightRealRounded: true,
        awb: {
          consigneeName: true,
          consigneeNumber: true,
          consigneeAddress: true,
          consigneeZip: true,
          totalCodValue: true,
          isCod: true,
          totalWeight: true,
          totalWeightFinalRounded: true,
        },
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
    q.where(e => e.awbNumber, w => w.equals(awbNumber));
    q.andWhere(e => e.isDeleted, w => w.isFalse());
    q.take(1);
    return await q.exec();
  }

  public static async validAwbNumbers(awbNumbers: string[]): Promise<AwbItemAttr[]> {
    const awbRepository = new OrionRepositoryService(AwbItemAttr);
    const q = awbRepository.findAll();
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
        weightReal: true,
        weightRealRounded: true,
        awb: {
          consigneeName: true,
          consigneeNumber: true,
          consigneeAddress: true,
          consigneeZip: true,
          totalCodValue: true,
          isCod: true,
        },
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
    q.where(e => e.awbNumber, w => w.in(awbNumbers));
    q.andWhere(e => e.isDeleted, w => w.isFalse());
    q.take(1000); // max 1000 to avoid taking too much data
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
      awbId: true,
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
    q.andWhere(e => e.isDeleted, w => w.isFalse());
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

  // TODO: deprecated
  public static async getDataDeliver(awbNumber: string): Promise<AwbDeliverManualVm> {
    const qb = createQueryBuilder();
    qb.addSelect('dpdd.awb_item_id', 'awbItemId');
    qb.addSelect('dpdd.awb_number', 'awbNumber');
    qb.addSelect('dpdd.do_pod_deliver_detail_id', 'doPodDeliverDetailId');
    qb.addSelect('dpd.do_pod_deliver_id', 'doPodDeliverId');
    qb.addSelect('dpdd.awb_status_id_last', 'awbStatusId');
    qb.from('do_pod_deliver_detail', 'dpdd');
    qb.innerJoin(
      'do_pod_deliver',
      'dpd',
      'dpdd.do_pod_deliver_id = dpd.do_pod_deliver_id AND dpd.is_deleted = false',
    );
    qb.where(
      'dpdd.awb_number = :awbNumber AND dpdd.is_deleted = false',
      {
        awbNumber,
      },
    );
    return await qb.getRawOne();
  }

  public static async awbStatusGroup(awbStatusId: number): Promise<string> {
    // awbStatusId validation if the param is not number or null
    if (isNaN(awbStatusId) || !awbStatusId) {
      awbStatusId = 0;
    }

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

  public static async isCancelDelivery(
    awbItemId: number,
  ): Promise<boolean> {
    const awbCancel = await AwbHistory.findOne({
      select: ['awbHistoryId'],
      where: {
        awbItemId,
        awbStatusId: AWB_STATUS.CANCEL_DLV,
        isDeleted: false,
      },
    });
    return awbCancel ? true : false;
  }

  // public static async isManifested(
  //   awbItemId: number,
  // ): Promise<boolean> {
  //   const awbManifested = await AwbHistory.findOne({
  //     select: ['awbHistoryId'],
  //     where: {
  //       awbItemId,
  //       awbStatusId: AWB_STATUS.MANIFESTED,
  //       isDeleted: false,
  //     },
  //   });
  //   return awbManifested ? true : false;
  // }

  public static async isManifested(
    awbNumber: string,
    awbItemId: number,
  ): Promise<boolean> {
    const query = `
      SELECT
        nostt as "awbNumber"
      FROM
        temp_stt
      WHERE
        nostt = :awbNumber
      LIMIT
        1;
    `;

    let rawData = await RawQueryService.queryWithParams(query, {
      awbNumber,
    });

    if (rawData.length < 1) {
      rawData = await AwbHistory.findOne({
        select: ['awbHistoryId'],
        where: {
          awbItemId,
          awbStatusId: AWB_STATUS.MANIFESTED,
          isDeleted: false,
        },
      });
    }

    return rawData ? true : false;
  }
  
  public static async validationContainAwBStatus(optionalManifested, awbNumber, awbItemId, isReturCheck): Promise<[boolean, string]> {
    let retVal = false;
    let retNote = null;
    let collectArrStatus = []
    let rawData = await AwbHistory.find({
      select: ['awbStatusId'],
      where: {
        awbItemId,
        isDeleted: false,
      }
    })

    for(let data of rawData){
      collectArrStatus.push(parseInt(data.awbStatusId.toString()))
    }

    if(collectArrStatus.includes(AWB_STATUS.CANCEL_DLV)){
      retVal = true
      retNote = `Resi ${awbNumber} telah di CANCEL oleh Partner`;
      return [retVal, retNote]
    }

    if(!collectArrStatus.includes(AWB_STATUS.MANIFESTED) && !optionalManifested){
      const query = `
        SELECT
          nostt as "awbNumber"
        FROM
          temp_stt
        WHERE
          nostt = :awbNumber
        LIMIT
          1;
      `;

      let rawData = await RawQueryService.queryWithParams(query, {
        awbNumber,
      });

      if(rawData.length < 1){
        retVal = true;
        retNote = `Resi ${awbNumber} belum pernah di MANIFESTED`;
        return [retVal, retNote]
      }
    }

    if (isReturCheck) {
      if(
        (collectArrStatus.includes(AWB_STATUS.RTN) || collectArrStatus.includes(AWB_STATUS.RTC) || collectArrStatus.includes(AWB_STATUS.RTA) ||collectArrStatus.includes(AWB_STATUS.RTW)) && !collectArrStatus.includes(AWB_STATUS.CANCEL_RETURN)){
        retVal = true;
        retNote = `Resi ${awbNumber} retur tidak dapat di proses`;
        return [retVal, retNote]
      }
    }
    
    return [retVal, retNote];
  }

  // TODO: open length awb number (12 or 15 digit)
  public static async isAwbNumberLenght(inputNumber: string): Promise<boolean> {
    const regexNumber = /^[0-9]+$/;
    return (inputNumber.length == 12 && regexNumber.test(inputNumber)) ? true : false;
  }

}
