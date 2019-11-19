import { TypeormBlueprint } from '@entity-factory/typeorm';

import { UserRole } from '../../shared/orm-entity/user-role';

export class UserRoleBlueprint extends TypeormBlueprint<UserRole> {
  constructor() {
    super();

    this.type(UserRole);

    this.define(async ({ faker, factory }) => ({
      branchId: 1,
      roleId: 1,
      userIdCreated: 1,
      userIdUpdated: 1,
      createdTime: new Date(),
      updatedTime: new Date(),
    }));
  }
}
