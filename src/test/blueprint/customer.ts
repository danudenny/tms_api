import { TypeormBlueprint } from '@entity-factory/typeorm';

import { Customer } from '../../shared/orm-entity/customer';
import { GeneratorService } from '../../shared/services/generator.service';

export class CustomerBlueprint extends TypeormBlueprint<Customer> {
  constructor() {
    super();

    this.type(Customer);

    this.define(async ({ faker, factory }) => ({
      customerCode: GeneratorService.alphanumeric(5),
      customerName: `Customer ${faker.random.word()}`,
      userIdCreated: 1,
      userIdUpdated: 1,
      createdTime: new Date(),
      updatedTime: new Date(),
    }));
  }
}
