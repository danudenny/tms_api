import { TypeormBlueprint } from '@entity-factory/typeorm';

import { UserRole } from '../../shared/orm-entity/user-role';

export class UserRoleBlueprint extends TypeormBlueprint<UserRole> {
  constructor() {
    super();

    this.type(UserRole);

    this.define(async ({ faker, factory }) => ({
      branch_id: 1,
      role_id: 1,
      user_id_created: 1,
      user_id_updated: 1,
      created_time: new Date(),
      updated_time: new Date(),
    }));
  }
}
