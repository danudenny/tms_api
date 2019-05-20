import { Module } from '@nestjs/common';

import { OrmRepositoryModule } from '../../../shared/orm-repository/orm-repository.module';
import { SharedModule } from '../../../shared/shared.module';
import { BranchController } from './branch.controller';
import { MobileDeliveryController } from './mobile/mobile.delivery.controller';
import { WebDeliveryController } from './web/web.delivery.controller';
import { WebDeliveryControllerbag } from './web/web.delivery.bag.controller';
import { WebDeliveryControllerList } from './web/web.delivery.list.controller';
import { MobileDashboardController } from './mobile/mobile.dashboard.controller';
import { MainServerServicesModule } from '../services/main-server-services.module';

@Module({
  imports: [OrmRepositoryModule, SharedModule,MainServerServicesModule],
  controllers: [
    BranchController,
    MobileDashboardController,
    MobileDeliveryController,
    WebDeliveryController,
  ],
})
export class MainServerControllersModule {}
