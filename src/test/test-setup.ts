import { EntityFactory } from '@entity-factory/core';
import { TypeormAdapter } from '@entity-factory/typeorm';
import { HttpStatus } from '@nestjs/common';
import fs = require('fs');
import { forEach } from 'lodash';
import path = require('path');
import { createConnection, getManager } from 'typeorm';

import { boot } from '../main-setup';
import { AuthLoginResponseVM, PermissionAccessResponseVM } from '../servers/auth/models/auth.vm';
import { AwbBlueprint } from './blueprint/awb';
import { AwbItemBlueprint } from './blueprint/awb-item';
import { BranchBlueprint } from './blueprint/branch';
import { CustomerBlueprint } from './blueprint/customer';
import { EmployeeBlueprint } from './blueprint/employee';
import { PartnerLogisticBlueprint } from './blueprint/partner-logistic';
import { RoleBlueprint } from './blueprint/role';
import { UserBlueprint } from './blueprint/user';
import { UserRoleBlueprint } from './blueprint/user-role';
import TEST_GLOBAL_VARIABLE from './test-global-variable';
import { TestSeed } from './test-seed';
import { TestUtility } from './test-utility';

process.env.NODE_ENV = 'test';

jest.setTimeout(5 * 60 * 1000);

beforeAll(async () => {
  // initiate typeorm for test setup only
  const ormConfig = require('../../ormconfig.test');
  const connection = await createConnection({
    ...ormConfig,
    logging: false,
  });

  // drop database tables
  await getManager().connection.dropDatabase();

  // reinitialize database structures
  const sql = fs.readFileSync(
    path.resolve(__dirname, '../../sql/init.sql'),
    'utf8',
  );
  await getManager().connection.query(sql);

  TEST_GLOBAL_VARIABLE.entityFactory = new EntityFactory({
    adapter: new TypeormAdapter(ormConfig),
    blueprints: [
      AwbBlueprint,
      AwbItemBlueprint,
      BranchBlueprint,
      CustomerBlueprint,
      EmployeeBlueprint,
      PartnerLogisticBlueprint,
      RoleBlueprint,
      UserBlueprint,
      UserRoleBlueprint,
    ],
  });

  await TestSeed.seed();

  (connection.options as any).logging = true;

  const serverModules = await boot();
  TEST_GLOBAL_VARIABLE.serverModules = serverModules;

  await TestUtility.getUnauthenticatedAuthServerAxios()
    .post('/auth/login', {
      clientId: 'web',
      username: 'adry',
      password: 'qwerty',
    })
    .then(response => {
      expect(response.status).toEqual(HttpStatus.OK);

      const result = response.data as AuthLoginResponseVM;
      expect(result.userId).toEqual('15');
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.username).toEqual('adry');

      TEST_GLOBAL_VARIABLE.webUserLogin = result;
    });

  await TestUtility.getUnauthenticatedAuthServerAxios()
    .post('/auth/login', {
      clientId: 'mobile',
      username: 'adry',
      password: 'qwerty',
    })
    .then(response => {
      expect(response.status).toEqual(HttpStatus.OK);

      const result = response.data as AuthLoginResponseVM;
      expect(result.userId).toEqual('15');
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.username).toEqual('adry');

      TEST_GLOBAL_VARIABLE.mobileUserLogin = result;
    });

  await TestUtility.getAuthenticatedAuthServerAxios('web')
    .post('/auth/permissionAccess', {
      clientId: 'web',
      roleId: 11,
      branchId: 121,
    })
    .then(response => {
      expect(response.status).toEqual(HttpStatus.OK);

      const result = response.data as PermissionAccessResponseVM;
      expect(result.branchCode).toEqual('3601001');
      expect(result.branchName).toEqual('Kantor Pusat');
      expect(result.userId).toEqual('15');
      expect(result.clientId).toEqual('web');
      expect(result.username).toEqual('adry');
      expect(result.permissionToken).toBeDefined();
      expect(result.roleName).toEqual('Root IT');

      TEST_GLOBAL_VARIABLE.webUserPermissionToken = result.permissionToken;
    });

  await TestUtility.getAuthenticatedAuthServerAxios('mobile')
    .post('/auth/permissionAccess', {
      clientId: 'mobile',
      roleId: 11,
      branchId: 121,
    })
    .then(response => {
      expect(response.status).toEqual(HttpStatus.OK);

      const result = response.data as PermissionAccessResponseVM;
      expect(result.branchCode).toEqual('3601001');
      expect(result.branchName).toEqual('Kantor Pusat');
      expect(result.userId).toEqual('15');
      expect(result.clientId).toEqual('mobile');
      expect(result.username).toEqual('adry');
      expect(result.permissionToken).toBeDefined();
      expect(result.roleName).toEqual('Root IT');

      TEST_GLOBAL_VARIABLE.mobileUserPermissionToken = result.permissionToken;
    });
});

afterAll(async () => {
  forEach(TEST_GLOBAL_VARIABLE.serverModules, (serverModule: any) => {
    serverModule.stopServer();
  });
});
