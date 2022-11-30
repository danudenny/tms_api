import { Module } from '@nestjs/common';
import axios from 'axios';

import { HttpRequestAxiosService } from '../../../shared/services/http-request-axios.service';
import { SharedModule } from '../../../shared/shared.module';
import { HubServerServicesModule } from '../services/hub-server-services.module';
import { ExternalHubMonitoringService } from '../services/monitoring/external.monitoring.service';
import { HubPackagesMonitoringService } from '../services/monitoring/monitoring.service';
import { ReportingHubPackageService } from '../services/monitoring/reporting-hub-package.service';
import { CentralSortirController } from './integration/central-sortir.controller';
import { HubMachinePackageController } from './integration/hub-machine-package.controller';
import { HubMachineSortirController } from './integration/hub-machine-sortir.controller';
import { InternalSortirListController } from './integration/internal-sortir-list.controller';
import { LogWayzimController } from './integration/log-wayzim.controller';
import { MonitoringProblemLebihSortirListController } from './integration/monitoring-problem-lebih-sortir-list.controller';
import { MonitoringProblemListController } from './integration/monitoring-problem-list.controller';
import { HubPackagesMonitoringController } from './monitoring/monitoring-list.controller';
import { ReportingHubPackageController } from './monitoring/reporting-hub-package.controller';
import { MobileSortationListController } from './sortation/mobile/mobile-sortation-list.controller';
import { MobileSortationController } from './sortation/mobile/mobile-sortation.controller';
import { SortationScanOutListController } from './sortation/web/sortation-scanout-list.controller';
import { SortationScanOutMonitoringController } from './sortation/web/sortation-scanout-monitoring.controller';
import { SortationPrintController } from './sortation/web/sortation-scanout-print.controller';
import { SortationScanOutController } from './sortation/web/sortation-scanout.controller';
import { SortationL2ModuleController } from './sortation/web/sortation-l2-module.controller';
import { SortationL2ListModuleController } from './sortation/web/sortation-l2-list.controller';
import { SortationMasterdataController } from './masterdata-controller';
import { SortationMasterdataService } from '../services/masterdata-service';
import { SortationReportController } from './sortation/web/sortation-report-controller';
import { CheckAwbController } from './awb/check-awb.controller';
import { CheckAwbListService } from '../services/check-awb/check-awb-list.service';
import { CheckAwbListController } from './awb/check-awb-list.controller';
import { CheckAwbReportController } from './awb/check-awb-report.controller';
import { CheckAwbReportService } from '../services/check-awb/check-awb-report.service';
import { SanityController } from './sanity/sanity.controllers';
import { IframeController } from './iframe/iframe.controller';
import { HubBagController } from './bag/bag.controller';
import { BagListController } from './bag/bag-list.controller';
import { BagReportingService } from '../services/bag/bag-reporting.service';
import { BagReportingController } from './bag/bag-report.controller';

const providers = [
  {
    provide: HttpRequestAxiosService,
    useFactory: () => new HttpRequestAxiosService(axios.create()),
  },
  ExternalHubMonitoringService,
  HubPackagesMonitoringService,
  ReportingHubPackageService,
  SortationMasterdataService,
  CheckAwbListService,
  CheckAwbReportService,
  BagReportingService,
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
    ReportingHubPackageController,
    HubPackagesMonitoringController,
    SortationReportController,
    CheckAwbController,
    CheckAwbListController,
    CheckAwbReportController,
    SanityController,
    IframeController,
    HubBagController,
    BagListController,
    BagReportingController,
  ],
})
export class HubServerControllersModule {}
