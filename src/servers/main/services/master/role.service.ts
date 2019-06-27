import { Injectable } from '@nestjs/common';
import { toInteger, isEmpty } from 'lodash';
import { MetaService } from '../../../../shared/services/meta.service';
import { RolePayloadVm, RoleFindAllResponseVm } from '../../models/role.vm';
import { BaseQueryPayloadVm } from '../../../../shared/models/base-query-payload.vm';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';

@Injectable()
export class RoleService {

  constructor() {}
  async listData(
    payload: BaseMetaPayloadVm,
  ): Promise<RoleFindAllResponseVm> {
    // mapping search field and operator default ilike
    payload.searchFields = [
      {
        field: 'roleName',
      },
    ];

    // add field for filter and transform to snake case
    payload.setFieldResolverMapAsSnakeCase(['roleName']);

    // add select field
    const qb = payload.buildQueryBuilder();
    qb.addSelect('role.role_id', 'roleId');
    qb.addSelect('role.role_name', 'roleName');
    qb.from('role', 'role');

    // exec raw query
    payload.applyPaginationToQueryBuilder(qb);
    const total = await qb.getCount();
    const data = await qb.execute();

    const result = new RoleFindAllResponseVm();
    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }
}
