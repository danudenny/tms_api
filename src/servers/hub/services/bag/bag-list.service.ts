import { HttpStatus, Injectable } from '@nestjs/common';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { Bag } from '../../../../shared/orm-entity/bag';
import { BagItem } from '../../../../shared/orm-entity/bag-item';
import { BagItemAwb } from '../../../../shared/orm-entity/bag-item-awb';
import { AuthService } from '../../../../shared/services/auth.service';
import { MetaService } from '../../../../shared/services/meta.service';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { HubBagListService } from '../../interfaces/bag-list.interface';
import { CheckBagDetailResponVm, CheckBagGpListResponVm } from '../../models/bag/hub-bag-list.respone';

@Injectable()
export class DefaultBagListService implements HubBagListService {
  constructor(
  ) {}

  public async listBag(payload: BaseMetaPayloadVm): Promise<CheckBagGpListResponVm> {
    const auth = AuthService.getAuthMetadata();
    const perm = AuthService.getPermissionTokenPayload();

    payload.fieldResolverMap['bagIdNew'] = 't1.bag_id_new';
    payload.fieldResolverMap['createdTime'] = 't1.created_time';
    payload.fieldResolverMap['branchId'] = 't5.branch_id';
    payload.fieldResolverMap['transportMode'] = 't1.transportation_mode';
    payload.fieldResolverMap['representativeCode'] = 't1.ref_representative_code';
    payload.fieldResolverMap['bagNumber'] = 't1.bag_number';

    if (payload.sortBy === '') {
      payload.sortBy = 'createdTime';
    }

    const repo = new OrionRepositoryService(Bag, 't1');
    const q = repo.findAllRaw();
    payload.applyToOrionRepositoryQuery(q, true);

    const selectColumn = [
      ['t1.bag_id_new', 'bagIdNew'],
      ['t2.bag_item_id_new', 'bagItemIdNew'],
      ['t1.bag_number', 'bagNumber'],
      ['t1.ref_representative_code', 'representativeCode'],
      ['t1.transportation_mode', 'transportMode'],
      ['t1.created_time', 'createdTime'],
      ['t5.branch_name', 'branchFromName'],
      ['t5.branch_id', 'branchScanId'],
      ['bagItem.awbCount', 'totalAwb'],
      ['CONCAT( CAST(t2.weight AS NUMERIC(20, 2)), \' Kg\' )', 'weight'],
    ];
    q.selectRaw(...selectColumn);
    q.innerJoinRaw(
        'bag_item',
        't2',
        `t2.bag_id = t1.bag_id AND t2.is_deleted = false
        INNER JOIN LATERAL(
          select
              count(bia.bag_item_awb_id) as awbCount
          from
              bag_item_awb bia
          where
              bia.bag_item_id = t2.bag_item_id
              AND bia.is_deleted = false
        )  as bagItem ON true AND bagItem.awbCount > 0` ),
      // branch created bag
      q.leftJoin(e => e.branch, 't5', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse()),
      );
    q.andWhere(e => e.isDeleted, w => w.isFalse());
    q.andWhere(e => e.isManual, w => w.isTrue());
    q.andWhere(e => e.isSortir ,  w => w.isFalse());

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();
    const result = new CheckBagGpListResponVm();

    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;

  }

  public async detailBag(payload: BaseMetaPayloadVm): Promise<CheckBagDetailResponVm> {
    payload.fieldResolverMap['bagIdNew'] = 'bi.bag_id_new';
    payload.fieldResolverMap['awbNumber'] = 'bia.awb_number';
    payload.fieldResolverMap['createdTime'] = 'bia.created_time';
    payload.fieldResolverMap['branchToName'] = 'd.district_name';

    if (payload.sortBy === '') {
      payload.sortBy = 'createdTime';
    }

    const repo = new OrionRepositoryService(BagItem, 'bi');
    const q = repo.findAllRaw();
    payload.applyToOrionRepositoryQuery(q, true);

    const selectColumn = [
      ['bia.awb_number', 'awbNumber'],
      ['bia.created_time', 'createdTime'],
      ['a.consignee_name', 'consigneeName'],
      ['a.consignee_address', 'consigneeAddress'],
      [`d.district_name`, 'branchToName'],
    ];

    q.selectRaw(...selectColumn)
    .innerJoin(e => e.bagItemAwbs, 'bia',  j =>
    j.andWhere(e => e.isDeleted, w => w.isFalse()))
    .innerJoin(e => e.bagItemAwbs.awbItem.awb, 'a', j =>
    j.andWhere(e => e.isDeleted, w => w.isFalse()))
    .leftJoinRaw('district', 'd', 'd.district_id = a.to_id and a.from_type = 40 ');

    const [objDetailCheckBag, count] = await Promise.all([
      q.exec(),
      q.countWithoutTakeAndSkip(),
    ]);

    const result = new CheckBagDetailResponVm();
    result.statusCode = HttpStatus.OK;
    result.message = 'Sukses ambil data detail bag AWB';
    result.data =  objDetailCheckBag;
    result.buildPagingWithPayload(payload, count);

    return result;

  }
}
