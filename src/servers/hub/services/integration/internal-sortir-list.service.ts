import { Injectable } from '@nestjs/common';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { MetaService } from '../../../../shared/services/meta.service';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { BranchSortirLog } from '../../../../shared/orm-entity/branch-sortir-log';
import { BranchSortirLogDetail } from '../../../../shared/orm-entity/branch-sortir-log-detail';
import { ListBranchSortirLogVm, DetailBranchSortirLogVm } from '../../models/internal-sortir-list.vm';
import { BranchSortirLogSummary } from '../../../../shared/orm-entity/branch-sortir-log-summary';
import {RawQueryService} from '../../../../shared/services/raw-query.service';

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
      ['scan_date::date', 'scanDate'],
      [`COUNT(
          DISTINCT CASE
            WHEN bsls.is_succeed = 1 AND bsls.awb_number != '' THEN bsls.awb_number::FLOAT
            ELSE null
          END
        )`, 'qtySucceed'],
      [`COUNT(
          DISTINCT CASE
            WHEN bsls.is_succeed = 0 AND bsls.awb_number != '' THEN bsls.awb_number::FLOAT
            ELSE null
          END
        )`, 'qtyFail'],
    );
    q.andWhere(e => e.isDeleted, w => w.isFalse());
    q.groupByRaw(`
      bsls.scan_date::date
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

    payload.fieldResolverMap['branchSortirLogId'] = 'bsls.branch_sortir_log_id';
    payload.fieldResolverMap['awbNumber'] = 'bsls.awb_number';
    payload.fieldResolverMap['createdTime'] = 'bsls.scan_date';
    payload.fieldResolverMap['scanDate'] = 'bsls.scan_date';
    payload.fieldResolverMap['isCod'] = 'bsls.is_cod';
    payload.fieldResolverMap['isSucceed'] = 'bsls.is_succeed';
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

    const repo = new OrionRepositoryService(BranchSortirLogSummary, 'bsls');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q);
    q.selectRaw(
      ['bsls.scan_date', 'scanDate'],
      ['b.branch_id', 'branchId'],
      ['b.branch_name', 'branchName'],
      [`bsls.chute_number`, 'noChute'],
      [`bsls.awb_number`, 'awbNumber'],
      [`bsls.seal_number`, 'sealNumber'],
      [`bsls.branch_id_lastmile`, 'branchIdLastmile'],
      [`bsls.is_cod`, 'isCod'],
      [`bsls.is_succeed`, 'isSucceed'],
      [`bsls.reason`, 'reason'],
      [`RANK () OVER (PARTITION BY awb_number ORDER BY scan_date DESC)`, 'rank'],
    );
    q.innerJoin(e => e.branch, 'b', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.andWhere(e => e.isDeleted, w => w.isFalse());

    const limit = payload.limit ? `LIMIT ${payload.limit}` : 'LIMIT 10';
    const order = payload.sortBy ? `ORDER BY ${payload.sortBy} ${payload.sortDir}` : '';
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
