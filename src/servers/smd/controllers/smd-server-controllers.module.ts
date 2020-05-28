import { Module } from '@nestjs/common';

import { SharedModule } from '../../../shared/shared.module';
import { SmdServerServicesModule } from '../services/smd-server-services.module';
import { ScanInController } from './integration/scanin.controller';
import { ScanOutController } from './integration/scanout.controller';
import { ScanOutListController } from './integration/scanout-list.controller';
import { ScanInSmdListController } from './integration/scanin-smd-list.controller';

@Module({
  imports: [SharedModule, SmdServerServicesModule],
  controllers: [
    ScanInController,
    ScanOutController,
    ScanOutListController,
    ScanInSmdListController,
  ],
})
export class SmdServerControllersModule {}
