import { TypeormBlueprint } from '@entity-factory/typeorm';

import { BagItem } from '../../shared/orm-entity/bag-item';
import { GeneratorService } from '../../shared/services/generator.service';

export class BagItemBlueprint extends TypeormBlueprint<BagItem> {
  constructor() {
    super();

    this.type(BagItem);

    this.define(async ({ faker, factory }) => ({
      weight: GeneratorService.integer(),
      bagSeq: GeneratorService.integer(),
      bagItemStatusIdLast: 1,
      branchIdLast: 1,
      userIdCreated: 1,
      createdTime: new Date(),
      userIdUpdated: 1,
      updatedTime: new Date(),
      bagItemHistoryId: 1,
      baggingIdLast: 1,
    }));
  }
}
