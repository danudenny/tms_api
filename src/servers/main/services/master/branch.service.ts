import { Injectable } from '@nestjs/common';

import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { RepositoryService } from '../../../../shared/services/repository.service';
import { BranchFindAllResponseVm } from '../../models/branch.response.vm';
import { AuthService } from '../../../../shared/services/auth.service';

@Injectable()
export class BranchService {
  async findAllByRequest(
    payload: BaseMetaPayloadVm,
  ): Promise<BranchFindAllResponseVm> {
    // mapping search field and operator default ilike
    payload.globalSearchFields = [
      {
        field: 'branchCode',
      },
      {
        field: 'branchName',
      },
    ];

    const q = RepositoryService.branch.findAllRaw();
    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['branch.branch_id', 'branchId'],
      ['branch.branch_name', 'branchName'],
      ['branch.branch_code', 'branchCode'],
    );
    q.andWhere(e => e.isDeleted, w => w.isFalse());

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new BranchFindAllResponseVm();
    result.data = data;

    result.buildPaging(payload.page, payload.limit, total);

    return result;
  }

  async findAllByRequestCod(
    payload: BaseMetaPayloadVm,
    merger: boolean = false,
  ): Promise<BranchFindAllResponseVm> {
    const authMeta = AuthService.getAuthData();
    const permissionPayload = AuthService.getPermissionTokenPayload();
    // mapping search field and operator default ilike
    payload.globalSearchFields = [
      {
        field: 'branchCode',
      },
      {
        field: 'branchName',
      },
    ];

    const q = RepositoryService.branch.findAllRaw();
    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['branch.branch_id', 'branchId'],
      ['branch.branch_name', 'branchName'],
      ['branch.branch_code', 'branchCode'],
    );

    //#region CT Transit
    q.innerJoin(e => e.codUserToBranch, 't2', j =>
      j
        .andWhere(e => e.isDeleted, w => w.isFalse())
        .andWhere(e => e.userId, w => w.equals(authMeta.userId)),
    );
    //#endregion

    q.andWhere(e => e.isDeleted, w => w.isFalse());

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const branchData = data.map(el => {
      return {
        branchId: el.branchId,
        branchName: el.branchName,
        branchCode: el.branchCode,
        branchCodeLabel: el.branchCode,
      };
    });

    let branchList = [];
    if (permissionPayload.roleName === 'Admin COD - Merger' && merger) {
      const branchIdAll = [];
      const branchCodeAll = [];

      data.forEach(el => {
        branchIdAll.push(el.branchId);
        branchCodeAll.push(el.branchCode);
      });

      const branchDataAll = {
        branchId: branchIdAll,
        branchName: 'Semua Gerai',
        branchCode: branchCodeAll,
        branchCodeLabel: '0',
      };

      branchList.push(branchDataAll, ...branchData);
    } else {
      branchList = branchData;
    }

    const result = new BranchFindAllResponseVm();
    result.data = branchList;

    result.buildPaging(payload.page, payload.limit, total);

    return result;
  }
}
