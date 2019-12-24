import { Module } from '@nestjs/common';

import { SharedModule } from '../../../shared/shared.module';
import { BackgroundServerServicesModule } from '../services/background-server-services.module';
import { TrackingNoteController } from './integration/trackingnote.controller';
import { CpsController } from './integration/cps.controller';

@Module({
  imports: [SharedModule, BackgroundServerServicesModule],
  controllers: [
    TrackingNoteController,
    CpsController,
  ],
})
export class BackgroundServerControllersModule {}
