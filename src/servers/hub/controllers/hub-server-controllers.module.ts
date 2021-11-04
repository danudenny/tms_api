import { Module } from '@nestjs/common';

import { SharedModule } from '../../../shared/shared.module';
import { HubServerServicesModule } from '../services/hub-server-services.module';
import { HubMachinePackageController } from './integration/hub-machine-package.controller';
import { HubMachineSortirController } from './integration/hub-machine-sortir.controller';
import { InternalSortirListController } from './integration/internal-sortir-list.controller';
import { MonitoringProblemListController } from './integration/monitoring-problem-list.controller';
import { MonitoringProblemLebihSortirListController } from './integration/monitoring-problem-lebih-sortir-list.controller';
import { CentralSortirController } from './integration/central-sortir.controller';

@Module({
  imports: [SharedModule, HubServerServicesModule],
  controllers: [
    HubMachineSortirController,
    HubMachinePackageController,
    InternalSortirListController,
    MonitoringProblemListController,
    MonitoringProblemLebihSortirListController,
    CentralSortirController,
  ],
})
export class HubServerControllersModule {}
