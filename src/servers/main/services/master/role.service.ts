import { Injectable } from '@nestjs/common';

import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { RepositoryService } from '../../../../shared/services/repository.service';
import { RoleFindAllResponseVm } from '../../models/role-response.vm';

@Injectable()
export class RoleService {
  async findAllByRequest(payload: BaseMetaPayloadVm): Promise<RoleFindAllResponseVm> {
    // mapping search field and operator default ilike
    payload.globalSearchFields = [
      {
        field: 'roleName',
      },
    ];

    const q = RepositoryService.role.findAllRaw();
    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['role.role_id', 'roleId'],
      ['role.role_name', 'roleName'],
    );
    q.andWhere(e => e.isDeleted, w => w.isFalse());

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new RoleFindAllResponseVm();
    result.data = data;
    result.buildPaging(payload.page, payload.limit, total);

    return result;
  }
}
