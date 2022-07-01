import { Module } from '@nestjs/common';
import axios from 'axios';

import { HttpRequestAxiosService } from '../../../shared/services/http-request-axios.service';
import { SharedModule } from '../../../shared/shared.module';
import { HubServerServicesModule } from '../services/hub-server-services.module';
import { SortationMasterdataService } from '../services/masterdata-service';
import { ExternalHubMonitoringService } from '../services/monitoring/external.monitoring.service';
import { HubPackagesMonitoringService } from '../services/monitoring/monitoring.service';
import { CentralSortirController } from './integration/central-sortir.controller';
import { HubMachinePackageController } from './integration/hub-machine-package.controller';
import { HubMachineSortirController } from './integration/hub-machine-sortir.controller';
import { InternalSortirListController } from './integration/internal-sortir-list.controller';
import { LogWayzimController } from './integration/log-wayzim.controller';
import { MonitoringProblemLebihSortirListController } from './integration/monitoring-problem-lebih-sortir-list.controller';
import { MonitoringProblemListController } from './integration/monitoring-problem-list.controller';
import { SortationMasterdataController } from './masterdata-controller';
import { HubPackagesMonitoringController } from './monitoring/monitoring-list.controller';
import { ReportingHubPackage } from './monitoring/reporting-hub-package.controller';
import { MobileSortationListController } from './sortation/mobile/mobile-sortation-list.controller';
import { MobileSortationController } from './sortation/mobile/mobile-sortation.controller';
import { SortationL2ListModuleController } from './sortation/web/sortation-l2-list.controller';
import { SortationL2ModuleController } from './sortation/web/sortation-l2-module.controller';
import { SortationScanOutListController } from './sortation/web/sortation-scanout-list.controller';
import { SortationScanOutMonitoringController } from './sortation/web/sortation-scanout-monitoring.controller';
import { SortationPrintController } from './sortation/web/sortation-scanout-print.controller';
import { SortationScanOutController } from './sortation/web/sortation-scanout.controller';

const providers = [
  {
    provide: HttpRequestAxiosService,
    useFactory: () => new HttpRequestAxiosService(axios.create()),
  },
  {
    inject: [HttpRequestAxiosService],
    provide: ExternalHubMonitoringService,
    useFactory: (httpRequestService: HttpRequestAxiosService) =>
      new ExternalHubMonitoringService(httpRequestService),
  },
  {
    inject: [ExternalHubMonitoringService],
    provide: HubPackagesMonitoringService,
    useFactory: (service: ExternalHubMonitoringService) =>
      new HubPackagesMonitoringService(service),
  },
  SortationMasterdataService,
];

@Module({
  imports: [SharedModule, HubServerServicesModule],
  providers,
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
