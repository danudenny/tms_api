// #region import
import { Module } from '@nestjs/common';

import { SharedModule } from '../../../shared/shared.module';
import { MainServerServicesModule } from '../services/main-server-services.module';
import { V1WebAwbCodController } from './cod/v1/web-awb-cod.controller';
import { V2WebCodReportController } from './cod/v2/web-cod-report.controller';

// #endregion
@Module({
  imports: [SharedModule, MainServerServicesModule],
  controllers: [
    V1WebAwbCodController,
    V2WebCodReportController,
  ],
})
export class MainServerControllersModule {}
