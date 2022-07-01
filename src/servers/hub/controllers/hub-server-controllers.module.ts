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
import { SortationScanOutListController } from './sortation/web/sortation-scanout-list.controller';
import { MobileSortationController } from './sortation/mobile/mobile-sortation.controller';
import { MobileSortationListController } from './sortation/mobile/mobile-sortation-list.controller';
import { SortationScanOutMonitoringController } from './sortation/web/sortation-scanout-monitoring.controller';
import { SortationPrintController } from './sortation/web/sortation-scanout-print.controller';
import { SortationL2ModuleController } from './sortation/web/sortation-l2-module.controller';
import { SortationL2ListModuleController } from './sortation/web/sortation-l2-list.controller';
import { SortationMasterdataController } from './masterdata-controller';
import { SortationMasterdataService } from '../services/masterdata-service';
import { ReportingHubPackage } from './monitoring/reporting-hub-package.controller';
import { HubPackagesMonitoringController } from './monitoring/monitoring-list.controller';

@Module({
  imports: [SharedModule, HubServerServicesModule],
  providers: [SortationMasterdataService],
  controllers: [
    HubMachineSortirController,
    HubMachinePackageController,
    InternalSortirListController,
    MonitoringProblemListController,
    MonitoringProblemLebihSortirListController,
    CentralSortirController,
    LogWayzimController,
    SortationScanOutController,
    SortationScanOutMonitoringController,
    SortationScanOutListController,
    SortationPrintController,
    MobileSortationController,
    MobileSortationListController,
    SortationL2ModuleController,
    SortationL2ListModuleController,
    SortationMasterdataController,
    ReportingHubPackage,
    HubPackagesMonitoringController,
  ],
})
export class HubServerControllersModule {}
