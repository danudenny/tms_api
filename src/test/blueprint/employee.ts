import { TypeormBlueprint } from '@entity-factory/typeorm';

import { Employee } from '../../shared/orm-entity/employee';
import { GeneratorService } from '../../shared/services/generator.service';

export class EmployeeBlueprint extends TypeormBlueprint<Employee> {
  constructor() {
    super();

    this.type(Employee);

    this.define(async ({ faker, factory }) => ({
      nik: GeneratorService.character(5),
      employeeName: faker.name.findName(),
      nickname: faker.name.firstName(),
      email1: faker.internet.email(),
      phone1: faker.phone.phoneNumber(),
      date_of_entry: new Date(),
      userIdCreated: 1,
      userIdUpdated: 1,
      createdTime: new Date(),
      updatedTime: new Date(),
    }));
  }
}
