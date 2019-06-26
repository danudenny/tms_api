import { Injectable } from '@nestjs/common';
import { toInteger, isEmpty } from 'lodash';
import { MetaService } from '../../../../shared/services/meta.service';
import { RolePayloadVm, RoleFindAllResponseVm } from '../../models/role.vm';
import { BaseQueryPayloadVm } from '../../../../shared/models/base-query-payload.vm';

@Injectable()
export class RoleService {

  constructor() {}
  async listData(
    payload: RolePayloadVm,
  ): Promise<RoleFindAllResponseVm> {
    // params
    const page = toInteger(payload.page) || 1;
    const take = toInteger(payload.limit) || 10;
    const offset = (page - 1) * take;
    const sortBy = isEmpty(payload.sortBy) ? 'role_name' : payload.sortBy;
    const sortDir = payload.sortDir === 'asc' ? 'asc' : 'desc';

    // NOTE: query with ORM
    const queryPayload = new BaseQueryPayloadVm();
    // add pagination
    queryPayload.take = take;
    queryPayload.skip = offset;
    // add sorting data
    queryPayload.sort = [
      {
        field: sortBy,
        dir: sortDir,
      },
    ];
    // add filter
    if (payload.filters) {
      queryPayload.filter = [
        [
          {
            field: 'role_name',
            operator: 'like',
            value: payload.filters.search,
          },
        ],
      ];
    }

    // add select field
    const qb = queryPayload.buildQueryBuilder();
    qb.addSelect('role.role_id', 'roleId');
    qb.addSelect('role.role_name', 'roleName');
    qb.from('role', 'role');

    // exec raw query
    const data = await qb.execute();
    const total = await qb.getCount();
    const result = new RoleFindAllResponseVm();
    result.data = data;
    result.paging = MetaService.set(page, take, total);
    return result;
  }
}
