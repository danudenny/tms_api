import { TypeormBlueprint } from '@entity-factory/typeorm';

import { GeneratorService } from '../../shared/services/generator.service';
import { AwbAttr } from '../../shared/orm-entity/awb-attr';

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

    // this.state('awb-items', async ({ faker, factory }) => ({
    //   awbItems: await factory.for(AwbItem).make(2),
    // }));
  }
}
