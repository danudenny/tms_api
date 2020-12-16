// #region import
import { Module } from '@nestjs/common';

import { SharedModule } from '../../../shared/shared.module';
import { MainServerServicesModule } from '../services/main-server-services.module';
import { V1WebAwbCodController } from './cod/v1/web-awb-cod.controller';
import { V2WebCodReportController } from './cod/v2/web-cod-report.controller';
import { SmdVendorReportController } from './smd/smd-vendor-report.controller';
import { SmdMonitoringReportController } from './smd/smd-monitoring-report.controller';
import { SmdScaninReportController } from './smd/smd-scanin-report.controller';
import { SmdScanoutReportController } from './smd/smd-scanout-report.controller';
import { KorwilMonitoringCoordinatorReportController } from './korwil/korwil-monitoring-coordinator-report.controller';
import { HubMonitoringReportController } from './pod/hub-monitoring-report.controller';

// #endregion
@Module({
  imports: [SharedModule, MainServerServicesModule],
  controllers: [
    V1WebAwbCodController,
    V2WebCodReportController,
    HubMonitoringReportController,
    SmdVendorReportController,
    SmdMonitoringReportController,
    SmdScaninReportController,
    SmdScanoutReportController,
    KorwilMonitoringCoordinatorReportController,
  ],
})
export class MainServerControllersModule {}
