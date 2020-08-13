import { Injectable, PayloadTooLargeException } from '@nestjs/common';
import moment = require('moment');
import { DoSmd } from '../../../../shared/orm-entity/do_smd';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { MetaService } from '../../../../shared/services/meta.service';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { ScanOutSmdVendorListResponseVm } from '../../models/scanout-smd-vendor.response.vm';

@Injectable()
export class ScanoutSmdVendorListService {
  static async scanOutVendorList(payload: BaseMetaPayloadVm): Promise<ScanOutSmdVendorListResponseVm> {

    // mapping search field and operator default ilike
    payload.fieldResolverMap['vendorId'] = 't2.vendor_id';
    payload.fieldResolverMap['vendorName'] = 't2.vendor_name';
    payload.fieldResolverMap['vendorCode'] = 't2.vendor_code';
    payload.fieldResolverMap['doSmdId'] = 't1.do_smd_id';
    payload.fieldResolverMap['doSmdCode'] = 't1.do_smd_code';
    payload.fieldResolverMap['doSmdTime'] = 't1.do_smd_time';
    payload.fieldResolverMap['totalBag'] = 't1.total_bag';
    payload.fieldResolverMap['totalBagging'] = 't1.total_bagging';
    payload.fieldResolverMap['totalBagRepresentative'] = 't1.total_bag_representative';

    payload.globalSearchFields = [
      {
        field: 'vendorName',
      },
      {
        field: 'vendorCode',
      },
      {
        field: 'doSmdCode',
      },
    ];

    const repo = new OrionRepositoryService(DoSmd, 't1');

    const q = repo.findAllRaw();
    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['t1.vendor_id', 'vendorId'],
      ['t1.vendor_name', 'vendorName'],
      ['t2.vendor_code', 'vendorCode'],
      ['t1.do_smd_id', 'doSmdId'],
      ['t1.do_smd_code', 'doSmdCode'],
      ['t1.do_smd_time', 'doSmdTime'],
      ['t1.total_bag', 'totalBag'],
      ['t1.total_bagging', 'totalBagging'],
      ['t1.total_bag_representative', 'totalBagRepresentative'],
    );

    q.leftJoin(e => e.vendor, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.andWhere(e => e.isVendor, w => w.isTrue());

    q.orderBy({ createdTime: 'DESC' });
    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new ScanOutSmdVendorListResponseVm();
    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }
}
