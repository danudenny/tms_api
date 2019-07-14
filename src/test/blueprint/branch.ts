import { TypeormBlueprint } from '@entity-factory/typeorm';

import { Branch } from '../../shared/orm-entity/branch';
import { GeneratorService } from '../../shared/services/generator.service';

export class BranchBlueprint extends TypeormBlueprint<Branch> {
  constructor() {
    super();

    this.type(Branch);

    this.define(async ({ faker, factory }) => ({
      branchCode: GeneratorService.alphanumeric(5),
      branchName: faker.random.word(),
      lft: 0,
      rgt: 0,
      depth: 0,
      priority: 1,
      user_id_created: 1,
      user_id_updated: 1,
      created_time: new Date(),
      updated_time: new Date(),
    }));
  }
}
