import { Injectable } from '@nestjs/common';
import { DoSmdStatusResponseVm, MappingDoSmdResponseVm, MappingVendorResponseVm } from '../../models/mapping-do-smd.response.vm';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';

import moment = require('moment');
import {DoSmd} from '../../../../shared/orm-entity/do_smd';
import {OrionRepositoryService} from '../../../../shared/services/orion-repository.service';
import {Vendor} from '../../../../shared/orm-entity/vendor';
import { DoSmdStatus } from '../../../../shared/orm-entity/do_smd_status';

@Injectable()
export class MasterDataService {

  static async mappingDoSMD(payload: BaseMetaPayloadVm): Promise<MappingDoSmdResponseVm> {
    // mapping field
    payload.fieldResolverMap['doSmdId'] = 't1.do_smd_id';
    payload.fieldResolverMap['doSmdCode'] = 't1.do_smd_code';

    // mapping search field and operator default ilike
    payload.globalSearchFields = [
      {
        field: 'doSmdCode',
      },
    ];
    const repo = new OrionRepositoryService(DoSmd, 't1');
    const q = repo.findAllRaw();
    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['t1.do_smd_id', 'doSmdId'],
      ['t1.do_smd_code', 'doSmdCode'],
    );
    q.innerJoin(e => e.doSmdDetails, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.andWhere(e => e.isDeleted, w => w.isFalse());
    q.andWhere(e => e.doSmdStatusIdLast, w => w.lessThan(3000));
    q.groupByRaw(`
      t1.do_smd_id
    `);
    q.orderBy({ doSmdCode: 'DESC' });
    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new MappingDoSmdResponseVm();
    result.data = data;
    result.buildPaging(payload.page, payload.limit, total);

    return result;
  }

  static async findAllDoSmdByRequestBranch(
    payload: BaseMetaPayloadVm,
    branchId: string,
  ): Promise<MappingDoSmdResponseVm> {
    // mapping field
    payload.fieldResolverMap['doSmdId'] = 't1.do_smd_id';
    payload.fieldResolverMap['doSmdCode'] = 't1.do_smd_code';

    // mapping search field and operator default ilike
    payload.globalSearchFields = [
      {
        field: 'doSmdCode',
      },
    ];
    const repo = new OrionRepositoryService(DoSmd, 't1');
    const q = repo.findAllRaw();
    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['t1.do_smd_id', 'doSmdId'],
      ['t1.do_smd_code', 'doSmdCode'],
    );
    q.innerJoin(e => e.doSmdDetails, 't2', j =>
      (
        j.andWhere(e => e.isDeleted, w => w.isFalse()),
        j.andWhere(e => e.branchId, w => w.equals(branchId))
      ),
    );
    q.andWhere(e => e.doSmdStatusIdLast, w => w.lessThan(3000));
    q.andWhere(e => e.isDeleted, w => w.isFalse());
    q.groupByRaw(`
      t1.do_smd_id
    `);
    q.orderBy({ doSmdCode: 'DESC' });
    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new MappingDoSmdResponseVm();
    result.data = data;
    result.buildPaging(payload.page, payload.limit, total);

    return result;
  }

  static async mappingVendor(payload: BaseMetaPayloadVm): Promise<MappingVendorResponseVm> {
    // mapping field
    payload.fieldResolverMap['vendorId'] = 't1.vendor_id';
    payload.fieldResolverMap['vendorCode'] = 't1.vendor_code';
    payload.fieldResolverMap['vendorName'] = 't1.vendor_name';

    // mapping search field and operator default ilike
    payload.globalSearchFields = [
      {
        field: 'vendorCode',
      },
      {
        field: 'vendorName',
      },
    ];

    if (!payload.sortBy) {
      payload.sortBy = 'vendorCode';
    }

    if (!payload.sortDir) {
      payload.sortDir = 'asc';
    }
    const repo = new OrionRepositoryService(Vendor, 't1');
    const q = repo.findAllRaw();
    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['t1.vendor_id', 'vendorId'],
      ['t1.vendor_code', 'vendorCode'],
      ['t1.vendor_name', 'vendorName'],
    );
    q.andWhere(e => e.isDeleted, w => w.isFalse());
    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new MappingVendorResponseVm();
    result.data = data;
    result.buildPaging(payload.page, payload.limit, total);

    return result;
  }

  static async getDoSmdStatus(payload: BaseMetaPayloadVm): Promise<DoSmdStatusResponseVm> {
    const repo = new OrionRepositoryService(DoSmdStatus, 'dss');
    const q = repo.findAllRaw();
    payload.applyToOrionRepositoryQuery(q, true);
    q.selectRaw(
      ['dss.do_smd_status_id', 'do_smd_status_id'],
      ['dss.do_smd_status_title', 'do_smd_status_title'],
    ).andWhere(e => e.isDeleted, w => w.isFalse());
    const [statuses, count] = await Promise.all([
      q.exec(),
      q.countWithoutTakeAndSkip(),
    ]);

    const result = new DoSmdStatusResponseVm();
    result.data = statuses;
    result.buildPagingWithPayload(payload, count);

    return result;
  }
}
