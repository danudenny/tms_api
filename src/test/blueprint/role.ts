import { TypeormBlueprint } from '@entity-factory/typeorm';

import { Role } from '../../shared/orm-entity/role';

export class RoleBlueprint extends TypeormBlueprint<Role> {
  constructor() {
    super();

    this.type(Role);

    this.define(async ({ faker, factory }) => ({
      roleName: faker.random.word(),
      userIdCreated: 1,
      userIdUpdated: 1,
      createdTime: new Date(),
      updatedTime: new Date(),
    }));
  }
}
