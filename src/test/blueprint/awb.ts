import { TypeormBlueprint } from '@entity-factory/typeorm';

import { Awb } from '../../shared/orm-entity/awb';
import { AwbItem } from '../../shared/orm-entity/awb-item';
import { GeneratorService } from '../../shared/services/generator.service';

export class AwbBlueprint extends TypeormBlueprint<Awb> {
  constructor() {
    super();

    this.type(Awb);

    this.define(async ({ faker, factory }) => ({
      awbNumber: GeneratorService.number(12),
      awbVersion: 1,
      awbCode: GeneratorService.alphanumeric(5),
      awbBookingId: GeneratorService.integer(),
      totalWeight: GeneratorService.integer(),
      totalWeightReal: GeneratorService.integer(),
      totalWeightRealRounded: GeneratorService.integer(),
      totalWeightRounded: GeneratorService.integer(),
      totalWeightVolume: GeneratorService.integer(),
      totalWeightVolumeRounded: GeneratorService.integer(),
      totalWeightFinal: GeneratorService.integer(),
      totalWeightFinalRounded: GeneratorService.integer(),
      basePrice: GeneratorService.integer(),
      discPercent: GeneratorService.integer(),
      discValue: GeneratorService.integer(),
      sellPrice: GeneratorService.integer(),
      totalBasePrice: GeneratorService.integer(),
      totalDiscPercent: GeneratorService.integer(),
      totalDiscValue: GeneratorService.integer(),
      totalSellPrice: GeneratorService.integer(),
      totalItemPrice: GeneratorService.integer(),
      insurance: 0,
      insuranceAdmin: GeneratorService.integer(),
      totalInsurance: 0,
      totalCodValue: 0,
      leadTimeMinDays: 0,
      leadTimeMaxDays: 1,
      leadTimeRunDays: 1,
      leadTimeFinalDays: 1,
      totalVolume: GeneratorService.integer(),
      totalItem: GeneratorService.integer(),
      tryAttempt: 0,
      totalCodItemPrice: 0,
      isSyncPod: false,
      isCod: false,
      isSyncErp: false,
      userIdCreated: 1,
      userIdUpdated: 1,
      createdTime: new Date(),
      updatedTime: new Date(),
    }));

    this.state('awb-items', async ({ faker, factory }) => ({
      awbItems: await factory.for(AwbItem).make(2),
    }));
  }
}
