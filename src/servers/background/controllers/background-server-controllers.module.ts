import { Module } from '@nestjs/common';

import { SharedModule } from '../../../shared/shared.module';
import { BackgroundServerServicesModule } from '../services/background-server-services.module';
import { TrackingNoteController } from './integration/trackingnote.controller';
import { CpsController } from './integration/cps.controller';
import { PartnerController } from './integration/partner.controller';
import { PartnerGojekController } from './integration/partner.gojek.controller';
import { DoReturnController } from './integration/do-return.controller';
import { PartnerMerchantController } from './integration/partner-merchant.controller';
import { MasterDataController } from './integration/masterdata.controller';

@Module({
  imports: [SharedModule, BackgroundServerServicesModule],
  controllers: [
    TrackingNoteController,
    CpsController,
    PartnerController,
    PartnerGojekController,
    DoReturnController,
    PartnerMerchantController,
    MasterDataController,
  ],
})
export class BackgroundServerControllersModule {}
