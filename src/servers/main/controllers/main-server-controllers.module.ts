import { Module } from '@nestjs/common';

import { OrmRepositoryModule } from '../../../shared/orm-repository/orm-repository.module';
import { SharedModule } from '../../../shared/shared.module';
import { MobileDeliveryController } from './mobile/mobile.delivery.controller';
import { WebDeliveryInController } from './web/web.delivery.in.controller';
import { WebDeliveryOutController } from './web/web.delivery.out.controller';
import { MobileDashboardController } from './mobile/mobile.dashboard.controller';
import { MainServerServicesModule } from '../services/main-server-services.module';
import { GabunganController } from './resi gabungan/gabungan.controller';
import { BranchController } from './master/branch.controller';
import { EmployeeController } from './master/employee.controller';
import { CustomerController } from './master/customer.controller';
import { AwbStatusController } from './master/awb-status.controller';
import { PartnerLogisticController } from './master/partner-logistic.controller';
import { ReasonController } from './master/reason.controller';

@Module({
  imports: [OrmRepositoryModule, SharedModule, MainServerServicesModule],
  controllers: [
    MobileDashboardController,
    MobileDeliveryController,
    WebDeliveryInController,
    WebDeliveryOutController,
    BranchController,
    GabunganController,
    EmployeeController,
    CustomerController,
    AwbStatusController,
    PartnerLogisticController,
    ReasonController,

  ],
})
export class MainServerControllersModule {}
