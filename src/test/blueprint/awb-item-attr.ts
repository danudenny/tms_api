import { TypeormBlueprint } from '@entity-factory/typeorm';

import { GeneratorService } from '../../shared/services/generator.service';
import { AwbItemAttr } from '../../shared/orm-entity/awb-item-attr';

export class AwbItemAttrBlueprint extends TypeormBlueprint<AwbItemAttr> {
  constructor() {
    super();

    this.type(AwbItemAttr);

    this.define(async ({ faker, factory }) => ({
      awbItemId: GeneratorService.integer(),
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
      tryAttempt: 1,
      awbThirdParty: '',
      branchIdNext: 11,
      awbNumber: GeneratorService.number(12).toString(),
      updatedTime: new Date(),
    }));

    // this.state('awb-items', async ({ faker, factory }) => ({
    //   awbItems: await factory.for(AwbItem).make(2),
    // }));
  }
}
