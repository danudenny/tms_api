import { TypeormBlueprint } from '@entity-factory/typeorm';

import { Reason } from '../../shared/orm-entity/reason';
import { GeneratorService } from '../../shared/services/generator.service';

export class ReasonBlueprint extends TypeormBlueprint<Reason> {
  constructor() {
    super();

    this.type(Reason);

    this.define(async ({ faker, factory }) => ({
      appsCode: 'tms',
      reasonCategory: 'pod',
      reasonType: 'problem',
      reasonCode: GeneratorService.alphanumeric(5),
      reasonName: `Reason ${faker.random.word()}`,
      userIdCreated: 1,
      userIdUpdated: 1,
      createdTime: new Date(),
      updatedTime: new Date(),
    }));
  }
}
