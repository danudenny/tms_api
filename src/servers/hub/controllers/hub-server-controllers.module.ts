import { Module } from '@nestjs/common';

import { SharedModule } from '../../../shared/shared.module';
import { HubServerServicesModule } from '../services/hub-server-services.module';
import { HubMachinePackageController } from './integration/hub-machine-package.controller';
import { HubMachineSortirController } from './integration/hub-machine-sortir.controller';
import { InternalSortirListController } from './integration/internal-sortir-list.controller';
import { MonitoringProblemListController } from './integration/monitoring-problem-list.controller';
import { MonitoringProblemLebihSortirListController } from './integration/monitoring-problem-lebih-sortir-list.controller';
import { CentralSortirController } from './integration/central-sortir.controller';
import { LogWayzimController } from './integration/log-wayzim.controller';
import { SortationScanOutController } from './sortation/web/sortation-scanout.controller';
import { SortationScanOutListController } from './sortation/web/sosrtation-scanout-list.controller';
import { MobileSortationController } from './sortation/mobile/mobile-sortation.controller';
import { MobileSortationListController } from './sortation/mobile/mobile-sortation-list.controller';

@Module({
  imports: [SharedModule, HubServerServicesModule],
  controllers: [
    HubMachineSortirController,
    HubMachinePackageController,
    InternalSortirListController,
    MonitoringProblemListController,
    MonitoringProblemLebihSortirListController,
    CentralSortirController,
    LogWayzimController,
    SortationScanOutController,
    SortationScanOutListController,
    MobileSortationController,
    MobileSortationListController,

  ],
})
export class HubServerControllersModule {}
