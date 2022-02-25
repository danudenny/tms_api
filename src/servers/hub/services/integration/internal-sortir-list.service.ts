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
      [`COUNT(bsls.awb_number) FILTER(WHERE bsls.is_succeed = 1)`, 'qtySucceed'],
      [`COUNT(bsls.awb_number) FILTER(WHERE bsls.is_succeed = 0)`, 'qtyFail'],
      // [`COUNT(
      //     DISTINCT CASE
      //       WHEN bsls.is_succeed = 1 AND bsls.awb_number != '' THEN bsls.awb_number
      //       WHEN bsls.is_succeed = 1 AND bsls.awb_number = '' THEN '1'
      //       ELSE null
      //     END
      //   )`, 'qtySucceed'],
      // [`COUNT(
      //     DISTINCT CASE
      //       WHEN bsls.is_succeed = 0 AND bsls.awb_number != '' THEN bsls.awb_number
      //       WHEN bsls.is_succeed = 0 AND bsls.awb_number = '' THEN '1'
      //       ELSE null
      //     END
      //   )`, 'qtyFail'],
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
    payload.fieldResolverMap['sealNumber'] = 'bsls.seal_number';
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

    const repo = new OrionRepositoryService(BranchSortirLogSummary, 'bsls');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);
    q.selectRaw(
      [`bsls.scan_date AS "scanDate",
      bsls.updated_time AS "updatedTime",
      b.branch_id AS "branchId",
      b.branch_name AS "branchName",
      bsls.chute_number AS "noChute",
      bsls.awb_number AS "awbNumber",
      bsls.seal_number AS "sealNumber",
      bl.branch_id AS "branchIdLastmile",
      bl.branch_name AS "branchNameLastmile",
      bsls.is_cod AS "isCod",
      bsls.is_succeed AS "isSucceed",
      bsls.reason`, 'reason'],
    );
    q.leftJoin(e => e.branch, 'b', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.leftJoin(e => e.branchLastmile, 'bl', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.andWhere(e => e.isDeleted, w => w.isFalse());
    q.orderByRaw('bsls.updated_time', 'DESC');
    // q.andWhere(e => e.awbNumber, w => w.notEquals(''));
    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new DetailBranchSortirLogVm();

    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }
}
