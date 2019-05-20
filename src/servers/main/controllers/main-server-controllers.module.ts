import { Module } from '@nestjs/common';

import { OrmRepositoryModule } from '../../../shared/orm-repository/orm-repository.module';
import { SharedModule } from '../../../shared/shared.module';
import { MobileDeliveryController } from './mobile/mobile.delivery.controller';
import { WebDeliveryController } from './web/web.delivery.controller';
import { MobileDashboardController } from './mobile/mobile.dashboard.controller';
import { MainServerServicesModule } from '../services/main-server-services.module';
import { BranchController } from './master/branch.controller';
import { EmployeeController } from './master/employee.controller';


@Module({
  imports: [OrmRepositoryModule, SharedModule, MainServerServicesModule],
  controllers: [
    MobileDashboardController,
    MobileDeliveryController,
    WebDeliveryController,
    BranchController,
    EmployeeController,
  ],
})
export class MainServerControllersModule {}
