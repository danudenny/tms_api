import { TypeormBlueprint } from '@entity-factory/typeorm';

import { Role } from '../../shared/orm-entity/role';

export class RoleBlueprint extends TypeormBlueprint<Role> {
  constructor() {
    super();

    this.type(Role);

    this.define(async ({ faker, factory }) => ({
      role_name: faker.random.word(),
      user_id_created: 1,
      user_id_updated: 1,
      created_time: new Date(),
      updated_time: new Date(),
    }));
  }
}
