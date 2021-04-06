import { Module } from '@nestjs/common';

import { SharedModule } from '../../../shared/shared.module';
import { HubServerServicesModule } from '../services/hub-server-services.module';
import { HubMachinePackageController } from './integration/hub-machine-package.controller';
import { HubMachineSortirController } from './integration/hub-machine-sortir.controller';
import { HubController } from './integration/hub-monitoring.controller';

@Module({
  imports: [SharedModule, HubServerServicesModule],
  controllers: [
    HubMachineSortirController,
    HubMachinePackageController,
    HubController,
  ],
})
export class HubServerControllersModule {}
