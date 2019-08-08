import { TypeormBlueprint } from '@entity-factory/typeorm';

import { AwbAttr } from '../../shared/orm-entity/awb-attr';
import { GeneratorService } from '../../shared/services/generator.service';

export class AwbAttrBlueprint extends TypeormBlueprint<AwbAttr> {
  constructor() {
    super();

    this.type(AwbAttr);

    this.define(async ({ faker, factory }) => ({
      awbId: null,
      awbHistoryIdLast: null,
      awbStatusIdLast: null,
      awbStatusIdLastPublic: 1,
      userIdLast: 1,
      branchIdLast: 1,
      leadTimeRunDays: 1,
      leadTimeFinalDays: 1,
      historyDateLast: new Date(),
      finalStatusDate: new Date(),
      awbStatusIdFinal: null,
      branchIdNext: 11,
      awbNumber: GeneratorService.number(12).toString(),
      userIdCreated: 1,
      userIdUpdated: 1,
      createdTime: new Date(),
      updatedTime: new Date(),
    }));
  }
}
