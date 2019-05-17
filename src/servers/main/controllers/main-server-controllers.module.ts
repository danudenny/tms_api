import { Module } from '@nestjs/common';

import { OrmRepositoryModule } from '../../../shared/orm-repository/orm-repository.module';
import { SharedModule } from '../../../shared/shared.module';
import { BranchController } from './branch.controller';
import { MobileDeliveryController } from './mobile/mobile.delivery.controller';
import { WebDeliveryController } from './web/web.delivery.controller';
import { MobileDashboardController } from './mobile/mobile.dashboard.controller';

@Module({
  imports: [OrmRepositoryModule, SharedModule],
  controllers: [
    BranchController,
    MobileDashboardController,
    MobileDeliveryController,
    WebDeliveryController,
    
  ],
})
export class MainServerControllersModule {}
