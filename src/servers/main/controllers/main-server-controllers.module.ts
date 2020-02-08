// #region import
import { Module } from '@nestjs/common';

import { SharedModule } from '../../../shared/shared.module';
import { MainServerServicesModule } from '../services/main-server-services.module';
import { CombinePackageController } from './combine-package/combine-package.controller';
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
import { WebAwbCountController } from './web/web-awb-count.controller';
import { WebAwbFilterController } from './web/web-awb-filter.controller';
import { WebAwbPodController } from './web/web-awb-pod.controller';
import { WebAwbUpdateStatusController } from './web/web-awb-update-status.controller';
import { WebBagPodController } from './web/web-bag-pod.controller';
import { WebDeliveryInController } from './web/web-delivery-in.controller';
import { WebDeliveryOutController } from './web/web-delivery-out.controller';
import { WebFirstMileController } from './web/web-first-mile.controller';
import { WebMonitoringController } from './web/web-monitoring.controller';
import { WebTrackingController } from './web/web-tracking.controller';
import { ProvincesController } from './master/provinces.controller';
import { CitiesController } from './master/cities.controller';
import { DistrictsController } from './master/districts.controller';
import { DoReturnStatusController } from './master/do-return-status.controller';
import { WebAwbDeliverController } from './web/web-awb-deliver.controller';
import { MobileAttendanceController } from './mobile/mobile-attendance.controller';
import { ReportPODController } from './report/report-pod.controller';
import { WebLastMileController } from './web/web-last-mile.controller';
import { WebAwbReturnController } from './web/web-awb-return.controller';
import { MobileKorwilController } from './mobile/mobile-korwil.controller';
import { MobileDeliveryInController } from './mobile/mobile-delivery-in.controller';
import { MobileDeliveryOutController } from './mobile/mobile-delivery-out.controller';
import { MobileAwbFilterController } from './mobile/mobile-awb-filter.controller';
import { DoReturnController } from './do_return/do_return_controller';
import { V1MobileInitController } from './mobile/v1/mobile-init.controller';
// #endregion
@Module({
  imports: [SharedModule, MainServerServicesModule],
  controllers: [
    AwbStatusController,
    AttachmentController,
    BranchController,
    CustomerController,
    EmployeeController,
    CombinePackageController,
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
    WebAwbPodController,
    WebBagPodController,
    WebDeliveryInController,
    WebDeliveryOutController,
    WebMonitoringController,
    WebAwbUpdateStatusController,
    WebAwbCountController,
    WebTrackingController,
    WebFirstMileController,
    WebAwbReturnController,
    ProvincesController,
    CitiesController,
    DistrictsController,
    WebAwbDeliverController,
    MobileAttendanceController,
    ReportPODController,
    WebLastMileController,
    MobileKorwilController,
    MobileDeliveryInController,
    MobileDeliveryOutController,
    MobileAwbFilterController,
    DoReturnStatusController,
    DoReturnController,
    V1MobileInitController,
  ],
})
export class MainServerControllersModule {}
