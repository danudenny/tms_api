import { Module } from '@nestjs/common';

import { SharedModule } from '../../../shared/shared.module';
import { SmdServerServicesModule } from '../services/smd-server-services.module';
import { ScanInController } from './integration/scanin.controller';

@Module({
  imports: [SharedModule, SmdServerServicesModule],
  controllers: [
    ScanInController,
  ],
})
export class SmdServerControllersModule {}
