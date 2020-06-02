import { Module } from '@nestjs/common';

import { SharedModule } from '../../../shared/shared.module';
import { SmdServerServicesModule } from '../services/smd-server-services.module';
import { ScanInController } from './integration/scanin.controller';
import { ScanOutController } from './integration/scanout.controller';
import { ScanOutListController } from './integration/scanout-list.controller';
import { ScanInSmdListController } from './integration/scanin-smd-list.controller';
import { MobileSmdListController } from './integration/mobile-smd-list.controller';
import { MobileSmdController } from './integration/mobile-smd.controller';

@Module({
  imports: [SharedModule, SmdServerServicesModule],
  controllers: [
    ScanInController,
    ScanOutController,
    ScanOutListController,
    ScanInSmdListController,
    MobileSmdController,
    MobileSmdListController,
  ],
})
export class SmdServerControllersModule {}
