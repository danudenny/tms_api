import { Module } from '@nestjs/common';

import { SharedModule } from '../../../shared/shared.module';
import { MainServerServicesModule } from '../services/main-server-services.module';
import { GabunganController } from './combine-package/combine-package.controller';
import { AttachmentController } from './master/attachment.controller';
import { AwbStatusController } from './master/awb-status.controller';
import { BranchController } from './master/branch.controller';
import { CustomerController } from './master/customer.controller';
import { EmployeeController } from './master/employee.controller';
import { PartnerLogisticController } from './master/partner-logistic.controller';
import { ReasonController } from './master/reason.controller';
import { RepresentativeController } from './master/representative.controller';
import { RolePermissionController } from './master/role-permission.controller';
import { RoleController } from './master/role.controller';
import { MobileCheckInController } from './mobile/mobile-check-in.controller';
import { MobileCheckOutController } from './mobile/mobile-check-out.controller';
import { MobileDashboardController } from './mobile/mobile-dashboard.controller';
import { MobileSyncController } from './mobile/mobile-sync.controller';
import { PrintController } from './print.controller';
import { WebAwbFilterController } from './web/web-awb-filter.controller';
import { WebAwbTroubleControlelr } from './web/web-awb-trouble.controller';
import { WebBagTroubleControlelr } from './web/web-bag-trouble.controller';
import { WebDeliveryInController } from './web/web-delivery-in.controller';
import { WebDeliveryOutController } from './web/web-delivery-out.controller';
import { WebMonitoringController } from './web/web-monitoring.controller';

@Module({
  imports: [SharedModule, MainServerServicesModule],
  controllers: [
    AwbStatusController,
    AttachmentController,
    BranchController,
    CustomerController,
    EmployeeController,
    GabunganController,
    MobileCheckInController,
    MobileCheckInController,
    MobileCheckOutController,
    MobileCheckOutController,
    MobileDashboardController,
    PartnerLogisticController,
    PrintController,
    ReasonController,
    RepresentativeController,
    RoleController,
    RolePermissionController,
    MobileCheckInController,
    MobileCheckOutController,
    MobileSyncController,
    WebAwbFilterController,
    WebAwbTroubleControlelr,
    WebBagTroubleControlelr,
    WebDeliveryInController,
    WebDeliveryOutController,
    WebMonitoringController,
  ],
})
export class MainServerControllersModule {}
