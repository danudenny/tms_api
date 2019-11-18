import { EntityFactory } from '@entity-factory/core';

import { AuthLoginResponseVM } from '../servers/auth/models/auth.vm';

const TEST_GLOBAL_VARIABLE: Partial<{
  entityFactory: EntityFactory,
  storage: { [key: string]: any };
  serverModules: { [key: string]: any };
  webUserLogin: AuthLoginResponseVM;
  mobileUserLogin: AuthLoginResponseVM;
  webUserPermissionToken: string;
  mobileUserPermissionToken: string;
}> = {};
export default TEST_GLOBAL_VARIABLE;
