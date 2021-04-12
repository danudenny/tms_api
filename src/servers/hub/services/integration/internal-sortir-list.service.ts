import { Injectable } from '@nestjs/common';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { MetaService } from '../../../../shared/services/meta.service';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { ListBranchSortirLogVm, DetailBranchSortirLogVm } from '../../models/internal-sortir-list.vm';
import { BranchSortirLogSummary } from '../../../../shared/orm-entity/branch-sortir-log-summary';
import { RawQueryService } from '../../../../shared/services/raw-query.service';

@Injectable()
export class InternalSortirListService {
  static async getListLogSortir(
    payload: BaseMetaPayloadVm,
  ): Promise<ListBranchSortirLogVm> {

    payload.fieldResolverMap['createdTime'] = 'bsls.scan_date';
    payload.fieldResolverMap['scanDate'] = 'bsls.scan_date';
    payload.fieldResolverMap['awbNumber'] = 'bsls.awb_number';
    payload.fieldResolverMap['isCod'] = 'bsls.is_cod';
    payload.fieldResolverMap['branchId'] = 'bsls.branch_id';

    payload.globalSearchFields = [
      {
        field: 'bsls.awbNumber',
      },
    ];

    const repo = new OrionRepositoryService(BranchSortirLogSummary, 'bsls');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);
    q.selectRaw(
      ['scan_date', 'scanDate'],
      [`COUNT(
          DISTINCT CASE
            WHEN bsls.is_succeed = 1 AND bsls.awb_number != '' THEN bsls.awb_number
            WHEN bsls.is_succeed = 1 AND bsls.awb_number = '' THEN '1'
            ELSE null
          END
        )`, 'qtySucceed'],
      [`COUNT(
          DISTINCT CASE
            WHEN bsls.is_succeed = 0 AND bsls.awb_number != '' THEN bsls.awb_number
            WHEN bsls.is_succeed = 0 AND bsls.awb_number = '' THEN '1'
            ELSE null
          END
        )`, 'qtyFail'],
    );
    q.andWhere(e => e.isDeleted, w => w.isFalse());
    q.groupByRaw(`
      bsls.scan_date
    `);

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new ListBranchSortirLogVm();

    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  static async getDetailLogSortir(
    payload: BaseMetaPayloadVm,
  ): Promise<DetailBranchSortirLogVm> {

    payload.fieldResolverMap['awbNumber'] = 'bsls.awb_number';
    payload.fieldResolverMap['createdTime'] = 'bsls.scan_date';
    payload.fieldResolverMap['updatedTime'] = 'bsls.updated_time';
    payload.fieldResolverMap['branchId'] = 'b.branch_id';
    payload.fieldResolverMap['branchName'] = 'b.branch_name';
    payload.fieldResolverMap['sealNumber'] = 'bag.seal_number';
    payload.fieldResolverMap['branchdLastmile'] = 'bl.branch_id';
    payload.fieldResolverMap['branchNameLastmile'] = 'bl.branch_name';
    payload.fieldResolverMap['scanDate'] = 'bsls.scan_date';
    payload.fieldResolverMap['isCod'] = 'bsls.is_cod';
    payload.fieldResolverMap['isSucceed'] = 'bsls.is_succeed';
    payload.fieldResolverMap['reason'] = 'bsls.reason';
    payload.fieldResolverMap['noChute'] = 'bsls.chute_number';

    payload.globalSearchFields = [
      {
        field: 'bsls.awb_number',
      },
      {
        field: 'bsls.chute_number',
      },
      {
        field: 'bsls.seal_number',
      },
    ];
    const map = {
      awbNumber: 'awbNumber',
      createdTime: '"scanDate"',
      scanDate: '"scanDate"',
      isCod: '"isCod"',
      isSucceed: '"isSucceed"',
      noChute: '"noChute"',
      updatedTime: '"updatedTime"',
      branchId: '"branchId"',
      branchName: '"branchName"',
      sealNumber: '"sealNumber"',
      branchdLastmile: '"branchdLastmile"',
      branchNameLastmile: '"branchNameLastmile"',
      reason: '"reason"',
    };
    const repo = new OrionRepositoryService(BranchSortirLogSummary, 'bsls');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q);
    q.selectRaw(
      ['bsls.scan_date', 'scanDate'],
      ['bsls.updated_time', 'updatedTime'],
      ['b.branch_id', 'branchId'],
      ['b.branch_name', 'branchName'],
      [`bsls.chute_number`, 'noChute'],
      [`bsls.awb_number`, 'awbNumber'],
      [`bag.seal_number`, 'sealNumber'],
      [`bl.branch_id`, 'branchIdLastmile'],
      [`bl.branch_name`, 'branchNameLastmile'],
      [`bsls.is_cod`, 'isCod'],
      [`bsls.is_succeed`, 'isSucceed'],
      [`bsls.reason`, 'reason'],
      [`RANK () OVER (PARTITION BY bsls.awb_number ORDER BY bsls.created_time DESC)`, 'rank'],
    );
    q.leftJoin(e => e.branch, 'b', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.leftJoin(e => e.branchLastmile, 'bl', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.leftJoin(e => e.bagItemAwb, 'bia', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.leftJoin(e => e.bagItemAwb.bagItem.bag, 'bag', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.andWhere(e => e.isDeleted, w => w.isFalse());
    q.groupByRaw(`
      bsls.reason,
      bsls.scan_date,
      bsls.updated_time,
      b.branch_id,
      b.branch_name,
      bsls.chute_number,
      bsls.awb_number,
      bag.seal_number,
      bl.branch_id,
      bl.branch_name,
      bsls.is_cod,
      bsls.is_succeed,
      bsls.created_time
    `);

    const limit = payload.limit ? `LIMIT ${payload.limit}` : 'LIMIT 10';
    const order = payload.sortBy ? `ORDER BY ${map[payload.sortBy]} ${payload.sortDir}` : '';
    const page = payload.limit ? `OFFSET ${payload.limit * (Number(payload.page) - 1)}` : '';

    const subQuery = q.getQuery();
    const queryData = `
      SELECT * FROM (
        ${subQuery}
      ) t
      WHERE rank = 1
      ${order}
      ${limit}
      ${page}
    `;
    const queryTotal = `
      SELECT COUNT(*) AS total FROM (
        ${subQuery}
      ) t
      WHERE rank = 1
    `;
    const data = await RawQueryService.query(queryData);
    const total = await RawQueryService.query(queryTotal);

    const result = new DetailBranchSortirLogVm();

    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total[0].total);

    return result;
  }
}
