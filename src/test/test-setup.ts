import { EntityFactory } from '@entity-factory/core';
import { TypeormAdapter } from '@entity-factory/typeorm';
import { HttpStatus } from '@nestjs/common';
import fs = require('fs');
import { forEach } from 'lodash';
import path = require('path');
import { createConnection, getManager } from 'typeorm';

import { boot } from '../main-setup';
import { AuthLoginResponseVM } from '../servers/auth/models/auth.vm';
import { AwbBlueprint } from './blueprint/awb';
import { AwbItemBlueprint } from './blueprint/awb-item';
import { BranchBlueprint } from './blueprint/branch';
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
      RoleBlueprint,
      UserBlueprint,
      UserRoleBlueprint,
    ],
  });

  await TestSeed.seed();

  // close connection due to servers will initiate their own typeorm connections
  await connection.close();

  const serverModules = await boot();
  TEST_GLOBAL_VARIABLE.serverModules = serverModules;

  await TestUtility.getUnauthenticatedAuthServerAxios()
    .post('/api/auth/login', {
      clientId: 'web',
      username: 'adry',
      password: 'qerty',
    })
    .then(response => {
      expect(response.status).toBe(HttpStatus.CREATED);

      const result = response.data as AuthLoginResponseVM;
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.username).toBe('adry');
      TEST_GLOBAL_VARIABLE.superUserLoginToken = response.data;
    });

  // TODO: Retrieve and assign TEST_GLOBAL_VARIABLE.superUserPermissionToken for later use for e2e tests
});

afterAll(async () => {
  forEach(TEST_GLOBAL_VARIABLE.serverModules, (serverModule: any) => {
    serverModule.stopServer();
  });
});
