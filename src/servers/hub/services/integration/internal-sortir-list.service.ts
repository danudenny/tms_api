import { Injectable } from '@nestjs/common';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { MetaService } from '../../../../shared/services/meta.service';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { BranchSortirLog } from '../../../../shared/orm-entity/branch-sortir-log';
import { BranchSortirLogDetail } from '../../../../shared/orm-entity/branch-sortir-log-detail';
import { ListBranchSortirLogVm, DetailBranchSortirLogVm } from '../../models/internal-sortir-list.vm';

@Injectable()
export class InternalSortirListService {
  static async getListLogSortir(
    payload: BaseMetaPayloadVm,
  ): Promise<ListBranchSortirLogVm> {

    payload.fieldResolverMap['createdTime'] = 'bsl.scan_date';
    payload.fieldResolverMap['scanDate'] = 'bsl.scan_date';
    payload.fieldResolverMap['awbNumber'] = 'bsld.awb_number';
    payload.fieldResolverMap['isCod'] = 'bsld.is_cod';
    payload.fieldResolverMap['branchId'] = 'bsld.branch_id';

    payload.globalSearchFields = [
      {
        field: 'bsld.awbNumber',
      },
    ];

    const repo = new OrionRepositoryService(BranchSortirLog, 'bsl');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);
    q.selectRaw(
      ['bsl.scan_date', 'scanDate'],
      ['bsl.qty_succeed', 'qtySucceed'],
      [`bsl.qty_fail`, 'qtyFail'],
      [`bsl.branch_sortir_log_id`, 'branchSortirLogId'],
    );
    q.innerJoin(e => e.branchSortirLogDetail, 'bsld', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.andWhere(e => e.isDeleted, w => w.isFalse());
    q.groupByRaw(`
      bsl.scan_date,
      bsl.qty_succeed,
      bsl.qty_fail,
      bsl.branch_sortir_log_id
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

    payload.fieldResolverMap['branchSortirLogId'] = 'bsld.branch_sortir_log_id';
    payload.fieldResolverMap['awbNumber'] = 'bsld.awb_number';
    payload.fieldResolverMap['createdTime'] = 'bsld.scan_date';
    payload.fieldResolverMap['scanDate'] = 'bsld.scan_date';
    payload.fieldResolverMap['isCod'] = 'bsld.is_cod';
    payload.fieldResolverMap['isSucceed'] = 'bsld.is_succeed';

    payload.globalSearchFields = [
      {
        field: 'bsld.awb_number',
      },
      {
        field: 'bsld.no_chute',
      },
      {
        field: 'bsld.seal_number',
      },
    ];

    const repo = new OrionRepositoryService(BranchSortirLogDetail, 'bsld');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);
    q.selectRaw(
      ['bsld.scan_date', 'scanDate'],
      ['b.branch_id', 'branchId'],
      ['b.branch_name', 'branchName'],
      [`bsld.no_chute`, 'noChute'],
      [`bsld.awb_number`, 'awbNumber'],
      [`bsld.seal_number`, 'sealNumber'],
      [`bsld.branch_id_lastmile`, 'branchIdLastmile'],
      [`bsld.is_cod`, 'isCod'],
      [`bsld.is_succeed`, 'isSucceed'],
      [`bsld.reason`, 'reason'],
    );
    q.innerJoin(e => e.branch, 'b', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.andWhere(e => e.isDeleted, w => w.isFalse());

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new DetailBranchSortirLogVm();

    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }
}
