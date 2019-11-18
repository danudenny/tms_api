import { TypeormBlueprint } from '@entity-factory/typeorm';

import { User } from '../../shared/orm-entity/user';

export class UserBlueprint extends TypeormBlueprint<User> {
  constructor() {
    super();

    this.type(User);

    this.define(async ({ faker, factory }) => ({
      first_name: faker.name.firstName(),
      last_name: faker.name.lastName(),
      username: `${faker.name.firstName()}`.toLowerCase(),
      password: 'd8578edf8458ce06fbc5bb76a58c5ca4', // qwerty
      user_id_created: 1,
      user_id_updated: 1,
      created_time: new Date(),
      updated_time: new Date(),
    }));
  }
}
