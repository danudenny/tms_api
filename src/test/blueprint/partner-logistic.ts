import { TypeormBlueprint } from '@entity-factory/typeorm';

import { PartnerLogistic } from '../../shared/orm-entity/partner-logistic';
import { GeneratorService } from '../../shared/services/generator.service';

export class PartnerLogisticBlueprint extends TypeormBlueprint<
  PartnerLogistic
> {
  constructor() {
    super();

    this.type(PartnerLogistic);

    this.define(async ({ faker, factory }) => ({
      partnerLogisticName: GeneratorService.alphanumeric(5),
      partnerLogisticEmail: faker.internet.email(),
      partnerLogisticNoTelp: faker.phone.phoneNumber(),
    }));
  }
}
