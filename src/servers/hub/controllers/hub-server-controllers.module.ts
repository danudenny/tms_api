import { Module } from '@nestjs/common';

import { SharedModule } from '../../../shared/shared.module';
import { HubServerServicesModule } from '../services/hub-server-services.module';
import { HubMachineSortirController } from './integration/hub-machine-sortir.controller';

@Module({
  imports: [SharedModule, HubServerServicesModule],
  controllers: [
    HubMachineSortirController,
  ],
})
export class HubServerControllersModule {}
