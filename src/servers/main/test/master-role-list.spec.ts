import { HttpStatus } from '@nestjs/common';
import { sortBy } from 'lodash';

import { BaseMetaPayloadVm } from '../../../shared/models/base-meta-payload.vm';
import { Role } from '../../../shared/orm-entity/role';
import { RepositoryService } from '../../../shared/services/repository.service';
import TEST_GLOBAL_VARIABLE from '../../../test/test-global-variable';
import { TestUtility } from '../../../test/test-utility';
import { RoleFindAllResponseVm } from '../models/role-response.vm';

describe('master-role-list', () => {
  let roles: Role[];

  beforeAll(async () => {
    roles = await TEST_GLOBAL_VARIABLE.entityFactory.for(Role).create(5);
  });

  it('Valid list', async () => {
    const payload = new BaseMetaPayloadVm();
    payload.page = 1;
    payload.limit = 2;

    await TestUtility.getAuthenticatedMainServerAxios()
      .post('master/role/list', payload)
      .then(async response => {
        expect(response.status).toEqual(HttpStatus.OK);

        const qRole = RepositoryService.role.findAll();

        const result = response.data as RoleFindAllResponseVm;

        expect(result.data).toBeDefined();
        expect(result.data.length).toEqual(payload.limit);

        expect(result.paging.currentPage).toEqual(1);
        expect(result.paging.nextPage).toEqual(2);
        expect(result.paging.limit).toEqual(payload.limit);

        const totalData = await qRole.countWithoutTakeAndSkip();
        expect(result.paging.totalData).toEqual(totalData);
      });
  });

  it('Verify created roles & sort', async () => {
    const payload = new BaseMetaPayloadVm();
    payload.page = 1;
    payload.limit = 10;

    const createdRoleIds = roles.map(e => e.roleId);
    payload.filters = [
      {
        field: 'roleId',
        operator: 'in',
        value: createdRoleIds,
      },
    ];

    payload.sortBy = 'roleName';
    payload.sortDir = 'asc';

    await TestUtility.getAuthenticatedMainServerAxios()
      .post('master/role/list', payload)
      .then(response => {
        expect(response.status).toEqual(HttpStatus.OK);

        const result = response.data as RoleFindAllResponseVm;
        expect(result.data.length).toEqual(5);
        expect(result.paging.totalData).toEqual(5);
        expect(
          result.data.filter(e => createdRoleIds.includes(e.roleId)).length,
        ).toEqual(5);

        const sortedRolesByRoleName = sortBy(roles, e => e.roleName);
        expect(result.data[0].roleId).toEqual(
          sortedRolesByRoleName[0].roleId,
        );

        const resultRole = result.data[0];
        expect(resultRole.roleId).toBeDefined();
        expect(resultRole.roleName).toBeDefined();

        const payloadRole = roles.find(
          e => e.roleId === resultRole.roleId,
        );
        expect(payloadRole.roleName).toEqual(resultRole.roleName);
      });
  });

  it('Verify all filters', async () => {
    const payload = new BaseMetaPayloadVm();
    payload.page = 1;
    payload.limit = 10;

    const roleToCheck = roles[0];

    payload.filters = [
      {
        field: 'roleName',
        operator: 'eq',
        value: roleToCheck.roleName,
      },
    ];

    await TestUtility.getAuthenticatedMainServerAxios()
      .post('master/role/list', payload)
      .then(response => {
        expect(response.status).toEqual(HttpStatus.OK);

        const result = response.data as RoleFindAllResponseVm;
        expect(result.data.length).toEqual(1);
        expect(result.paging.totalData).toEqual(1);

        const resultRole = result.data[0];
        expect(resultRole.roleId).toEqual(roleToCheck.roleId);
        expect(resultRole.roleName).toEqual(roleToCheck.roleName);
      });
  });

  it('Verify global search', async () => {
    const payload = new BaseMetaPayloadVm();
    payload.page = 1;
    payload.limit = 10;

    const roleToCheck = roles[0];

    payload.search = roleToCheck.roleName;

    await TestUtility.getAuthenticatedMainServerAxios()
      .post('master/role/list', payload)
      .then(response => {
        expect(response.status).toEqual(HttpStatus.OK);

        const result = response.data as RoleFindAllResponseVm;
        expect(result.data.length).toEqual(1);
        expect(result.paging.totalData).toEqual(1);

        const resultRole = result.data[0];
        expect(resultRole.roleId).toEqual(roleToCheck.roleId);
        expect(resultRole.roleName).toEqual(roleToCheck.roleName);
      });
  });
});
