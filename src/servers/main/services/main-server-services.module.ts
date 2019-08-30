import { Module } from '@nestjs/common';

import { SharedModule } from '../../../shared/shared.module';
import { PackageService } from './combine-package/package.services';
import { AwbStatusService } from './master/awb-status.service';
import { BranchService } from './master/branch.service';
import { CustomerService } from './master/customer.service';
import { EmployeeService } from './master/employee.service';
import { PartnerLogisticService } from './master/partner-logistic.service';
import { ReasonService } from './master/reason.service';
import { RepresentativeService } from './master/representative.service';
import { RoleService } from './master/role.service';
import { MobileCheckInService } from './mobile/mobile-check-in.service';
import { MobileCheckOutService } from './mobile/mobile-check-out.service';
import { WebAwbFilterService } from './web/web-awb-filter.service';
import { WebDeliveryInService } from './web/web-delivery-in.service';
import { WebDeliveryOutService } from './web/web-delivery-out.service';
import { WebMonitoringService } from './web/web-monitoring.service';

@Module({
  imports: [SharedModule],
  providers: [
    AwbStatusService,
    BranchService,
    CustomerService,
    EmployeeService,
    PackageService,
    MobileCheckInService,
    MobileCheckOutService,
    WebAwbFilterService,
    PartnerLogisticService,
    ReasonService,
    RepresentativeService,
    RoleService,
    WebAwbFilterService,
    WebDeliveryInService,
    WebDeliveryOutService,
    WebMonitoringService,
  ],
  exports: [
    AwbStatusService,
    BranchService,
    CustomerService,
    EmployeeService,
    PackageService,
    MobileCheckInService,
    MobileCheckOutService,
    WebAwbFilterService,
    PartnerLogisticService,
    ReasonService,
    RepresentativeService,
    RoleService,
    WebAwbFilterService,
    WebDeliveryInService,
    WebDeliveryOutService,
    WebMonitoringService,
  ],
})
export class MainServerServicesModule {}
