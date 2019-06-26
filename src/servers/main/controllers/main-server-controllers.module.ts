import { Module } from '@nestjs/common';

import { OrmRepositoryModule } from '../../../shared/orm-repository/orm-repository.module';
import { SharedModule } from '../../../shared/shared.module';
import { MainServerServicesModule } from '../services/main-server-services.module';
import { AwbStatusController } from './master/awb-status.controller';
import { BranchController } from './master/branch.controller';
import { CustomerController } from './master/customer.controller';
import { EmployeeController } from './master/employee.controller';
import { PartnerLogisticController } from './master/partner-logistic.controller';
import { ReasonController } from './master/reason.controller';
import { RoleController } from './master/role.controller';
import { MobileDashboardController } from './mobile/mobile.dashboard.controller';
import { MobileDeliveryController } from './mobile/mobile.delivery.controller';
import { GabunganController } from './resi gabungan/gabungan.controller';
import { WebAwbTroubleControlelr } from './web/web-awb-trouble.controller';
import { WebDeliveryInController } from './web/web.delivery.in.controller';
import { WebDeliveryOutController } from './web/web.delivery.out.controller';

@Module({
  imports: [OrmRepositoryModule, SharedModule, MainServerServicesModule],
  controllers: [
    MobileDashboardController,
    MobileDeliveryController,
    WebAwbTroubleControlelr,
    WebDeliveryInController,
    WebDeliveryOutController,
    BranchController,
    GabunganController,
    EmployeeController,
    CustomerController,
    AwbStatusController,
    PartnerLogisticController,
    ReasonController,
    RoleController,
  ],
})
export class MainServerControllersModule {}
