import { EntityFactory } from '@entity-factory/core';

const TEST_GLOBAL_VARIABLE: Partial<{
  entityFactory: EntityFactory,
  storage: { [key: string]: any };
  serverModules: { [key: string]: any };
  superUserLoginToken: string;
  superUserPermissionToken: string;
}> = {};
export default TEST_GLOBAL_VARIABLE;
