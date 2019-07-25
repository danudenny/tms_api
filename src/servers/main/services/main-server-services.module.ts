import { Module } from '@nestjs/common';

import { OrmRepositoryModule } from '../../../shared/orm-repository/orm-repository.module';
import { SharedModule } from '../../../shared/shared.module';
import { GabunganService } from './combine-package/gabungan.services';
import { AwbStatusService } from './master/awb-status.service';
import { BranchService } from './master/branch.service';
import { CustomerService } from './master/customer.service';
import { EmployeeService } from './master/employee.service';
import { PartnerLogisticService } from './master/partner-logistic.service';
import { ReasonService } from './master/reason.service';
import { RepresentativeService } from './master/representative.service';
import { RoleService } from './master/role.service';
import { DashboardService } from './mobile/dashboard.service';
import { MobileDeliveryService } from './mobile/delivery.service';
import { MobileCheckInService } from './mobile/mobile-check-in.service';
import { MobileCheckOutService } from './mobile/mobile-check-out.service';
import { RedeliveryService } from './mobile/redelivery.services';
import { WebAwbFilterService } from './web/web-awb-filter.service';
import { WebDeliveryInService } from './web/web-delivery-in.service';
import { WebDeliveryOutService } from './web/web-delivery-out.service';

@Module({
  imports: [OrmRepositoryModule, SharedModule],
  providers: [
    AwbStatusService,
    BranchService,
    CustomerService,
    DashboardService,
    EmployeeService,
    GabunganService,
    MobileCheckInService,
    MobileCheckOutService,
    MobileDeliveryService,
    PartnerLogisticService,
    ReasonService,
    RedeliveryService,
    RepresentativeService,
    RoleService,
    WebAwbFilterService,
    WebDeliveryInService,
    WebDeliveryOutService,
  ],
  exports: [
    AwbStatusService,
    BranchService,
    CustomerService,
    DashboardService,
    EmployeeService,
    GabunganService,
    MobileCheckInService,
    MobileCheckOutService,
    MobileDeliveryService,
    PartnerLogisticService,
    ReasonService,
    RedeliveryService,
    RepresentativeService,
    RoleService,
    WebAwbFilterService,
    WebDeliveryInService,
    WebDeliveryOutService,
  ],
})
export class MainServerServicesModule {}
