import { forEach } from 'lodash';

import { boot } from '../main-setup';
import TEST_GLOBAL_VARIABLE from './test-global-variable';

process.env.NODE_ENV = 'test';

jest.setTimeout(5 * 60 * 1000);

beforeAll(async () => {
  const serverModules = await boot();
  TEST_GLOBAL_VARIABLE.serverModules = serverModules;
});

afterAll(async () => {
  forEach(TEST_GLOBAL_VARIABLE.serverModules, (serverModule: any) => {
    serverModule.stopServer();
  });
});
