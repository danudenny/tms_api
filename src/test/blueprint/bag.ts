import { TypeormBlueprint } from '@entity-factory/typeorm';

import { Bag } from '../../shared/orm-entity/bag';
import { BagItem } from '../../shared/orm-entity/bag-item';
import { GeneratorService } from '../../shared/services/generator.service';

export class BagBlueprint extends TypeormBlueprint<Bag> {
  constructor() {
    super();

    this.type(Bag);

    this.define(async ({ faker, factory }) => ({
      bagNumber: GeneratorService.number(12),
      representativeIdTo: 1,
      userIdCreated: 1,
      createdTime: new Date(),
      userIdUpdated: 1,
      updatedTime: new Date(),
      userId: 1,
      branchId: 1,
      bagDate: new Date(),
      bagDateReal: new Date(),
      refBranchCode: GeneratorService.alphanumeric(5),
      refRepresentativeCode: GeneratorService.alphanumeric(5),
    }));

    this.state('bag-items', async ({ faker, factory }) => ({
      bagItems: await factory.for(BagItem).make(2),
    }));
  }
}
