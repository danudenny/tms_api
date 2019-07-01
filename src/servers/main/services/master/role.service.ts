import { Injectable } from '@nestjs/common';

import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { MetaService } from '../../../../shared/services/meta.service';
import { RoleFindAllResponseVm } from '../../models/role.vm';

@Injectable()
export class RoleService {
  constructor() {}
  async listData(payload: BaseMetaPayloadVm): Promise<RoleFindAllResponseVm> {
    // mapping search field and operator default ilike
    payload.globalSearchFields = [
      {
        field: 'roleName',
      },
    ];

    // add select field
    const qb = payload.buildQueryBuilder();
    qb.addSelect('role.role_id', 'roleId');
    qb.addSelect('role.role_name', 'roleName');
    qb.from('role', 'role');

    const total = await qb.getCount();

    // exec raw query
    payload.applyPaginationToQueryBuilder(qb);
    const data = await qb.execute();

    const result = new RoleFindAllResponseVm();
    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }
}
