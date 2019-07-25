import { Module } from '@nestjs/common';

import { OrmRepositoryModule } from '../../../shared/orm-repository/orm-repository.module';
import { SharedModule } from '../../../shared/shared.module';
import { MainServerServicesModule } from '../services/main-server-services.module';
import { GabunganController } from './combine-package/combine-package.controller';
import { AwbStatusController } from './master/awb-status.controller';
import { BranchController } from './master/branch.controller';
import { CustomerController } from './master/customer.controller';
import { EmployeeController } from './master/employee.controller';
import { PartnerLogisticController } from './master/partner-logistic.controller';
import { ReasonController } from './master/reason.controller';
import { RepresentativeController } from './master/representative.controller';
import { RolePermissionController } from './master/role-permission.controller';
import { RoleController } from './master/role.controller';
import { MobileCheckInController } from './mobile/mobile.check-in.controller';
import { MobileCheckOutController } from './mobile/mobile.check-out.controller';
import { MobileDashboardController } from './mobile/mobile.dashboard.controller';
import { MobileDeliveryController } from './mobile/mobile.delivery.controller';
import { PrintController } from './print.controller';
import { WebAwbFilterController } from './web/web-awb-filter.controller';
import { WebAwbTroubleControlelr } from './web/web-awb-trouble.controller';
import { WebBagTroubleControlelr } from './web/web-bag-trouble.controller';
import { WebDeliveryInController } from './web/web-delivery-in.controller';
import { WebDeliveryOutController } from './web/web-delivery-out.controller';

@Module({
  imports: [OrmRepositoryModule, SharedModule, MainServerServicesModule],
  controllers: [
    AwbStatusController,
    BranchController,
    CustomerController,
    EmployeeController,
    GabunganController,
    MobileCheckInController,
    MobileCheckInController,
    MobileCheckOutController,
    MobileCheckOutController,
    MobileDashboardController,
    MobileDeliveryController,
    PartnerLogisticController,
    PrintController,
    ReasonController,
    RepresentativeController,
    RoleController,
    RolePermissionController,
    WebAwbFilterController,
    WebAwbTroubleControlelr,
    WebBagTroubleControlelr,
    WebDeliveryInController,
    WebDeliveryOutController,
  ],
})
export class MainServerControllersModule {}
