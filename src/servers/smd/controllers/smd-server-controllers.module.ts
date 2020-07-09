import { Module } from '@nestjs/common';

import { SharedModule } from '../../../shared/shared.module';
import { SmdServerServicesModule } from '../services/smd-server-services.module';
import { ScanInController } from './integration/scanin.controller';
import { ScanOutController } from './integration/scanout.controller';
import { ScanOutListController } from './integration/scanout-list.controller';
import { ScanInSmdListController } from './integration/scanin-smd-list.controller';
import { MobileSmdListController } from './integration/mobile-smd-list.controller';
import { MobileSmdController } from './integration/mobile-smd.controller';
import { ReasonSmdController } from './integration/reason-smd.controller';
import { SmdBaggingController } from './integration/smd-bagging.controller';
import {MasterDataController} from './integration/masterdata.controller';
import {SmdPrintController} from './integration/print-smd.controller';
import { VehicleSmdController } from './integration/vehicle-smd.controller';
import { MonitoringSmdController } from './integration/smd-monitoring.controller';
import { ScanOutExportController } from './integration/scanout-export.controller';

@Module({
  imports: [SharedModule, SmdServerServicesModule],
  controllers: [
    MasterDataController,
    ScanInController,
    ScanOutController,
    ScanOutListController,
    ScanInSmdListController,
    MobileSmdController,
    MobileSmdListController,
    ReasonSmdController,
    SmdBaggingController,
    SmdPrintController,
    VehicleSmdController,
    MonitoringSmdController,
    ScanOutExportController,
  ],
})
export class SmdServerControllersModule {}
