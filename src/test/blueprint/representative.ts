import { TypeormBlueprint } from '@entity-factory/typeorm';

import { Representative } from '../../shared/orm-entity/representative';
import { GeneratorService } from '../../shared/services/generator.service';

export class RepresentativeBlueprint extends TypeormBlueprint<Representative> {
  constructor() {
    super();

    this.type(Representative);

    this.define(async ({ faker, factory }) => ({
      representativeCode: GeneratorService.alphanumeric(5),
      representativeName: `Representative ${faker.random.word()}`,
      userIdCreated: 1,
      userIdUpdated: 1,
      createdTime: new Date(),
      updatedTime: new Date(),
    }));
  }
}
