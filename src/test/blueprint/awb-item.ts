import { TypeormBlueprint } from '@entity-factory/typeorm';

import { AwbItem } from '../../shared/orm-entity/awb-item';
import { GeneratorService } from '../../shared/services/generator.service';

export class AwbItemBlueprint extends TypeormBlueprint<AwbItem> {
  constructor() {
    super();

    this.type(AwbItem);

    this.define(async ({ faker, factory }) => ({
      awbStatusIdLastPublic: GeneratorService.integer(),
      tryAttempt: 0,
      leadTimeRunDays: 1,
      leadTimeFinalDays: 1,
      codItemPrice: 0,
      codValue: 0,
      userIdCreated: 1,
      userIdUpdated: 1,
      createdTime: new Date(),
      updatedTime: new Date(),
    }));
  }
}
