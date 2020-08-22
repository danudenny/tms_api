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
import { WebAwbCountService } from './web/web-awb-count.service';
import { MobileAttendanceService } from './mobile/mobile-attendance.service';
import { LastMileDeliveryInService } from './mobile/mobile-last-mile-delivery-in.service';
import { LastMileDeliveryOutService } from './mobile/mobile-last-mile-delivery-out.service';
import { MobileAwbFilterService } from './mobile/mobile-awb-filter.service';
import { DoReturnService } from './do-return/do-return.service';
import { HubTransitDeliveryService } from './web/hub-transit/hub-transit-delivery.service';
import { MobileDeliveryInService } from './mobile/mobile-delivery-in.service';
import {HubSortirService} from './web/hub-transit/hub-sortir.service';
import { SmsTrackingService } from './web/sms-tracking.service';
import { V1MobileDivaPaymentService } from './mobile/v1/mobile-diva-payment.service';

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
    WebAwbCountService,
    MobileAttendanceService,
    LastMileDeliveryInService,
    LastMileDeliveryOutService,
    MobileAwbFilterService,
    DoReturnService,
    MobileDeliveryInService,
    HubTransitDeliveryService,
    HubSortirService,
    SmsTrackingService,
    V1MobileDivaPaymentService,
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
    WebAwbCountService,
    MobileAttendanceService,
    LastMileDeliveryInService,
    LastMileDeliveryOutService,
    MobileAwbFilterService,
    DoReturnService,
    HubTransitDeliveryService,
    MobileDeliveryInService,
    HubSortirService,
    SmsTrackingService,
    V1MobileDivaPaymentService,
  ],
})
export class MainServerServicesModule {}
