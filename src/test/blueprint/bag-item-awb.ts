import { TypeormBlueprint } from '@entity-factory/typeorm';

import { BagItemAwb } from '../../shared/orm-entity/bag-item-awb';
import { GeneratorService } from '../../shared/services/generator.service';

export class BagItemAwbBlueprint extends TypeormBlueprint<BagItemAwb> {
  constructor() {
    super();

    this.type(BagItemAwb);

    this.define(async ({ faker, factory }) => ({
      userIdCreated: 1,
      createdTime: new Date(),
      userIdUpdated: 1,
      updatedTime: new Date(),
      awbNumber: GeneratorService.number(12),
      weight: GeneratorService.integer(),
      sendTrackingNote: GeneratorService.integer(),
      sendTrackingNoteOut: GeneratorService.integer(),
    }));
  }
}
