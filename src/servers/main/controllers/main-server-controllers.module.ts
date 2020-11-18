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
import { MasterPartnerController } from './master/partner.controller';
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
import { PrintByStoreController } from './print-by-store.controller';

import { DoReturnController } from './do_return/do_return_controller';
import { V1MobileInitController } from './mobile/v1/mobile-init.controller';
import { V1MobileSyncController } from './mobile/v1/mobile-sync.controller';
import { WebHubController } from './web/web-hub.controller';
import { V1MobileAttendanceController } from './mobile/v1/mobile-attendance.controller';
import { V1WebTrackingController } from './web/v1/web-tracking.controller';
import { SmsTrackingController } from './web/sms-tracking.controller';
import { V2MobileSyncController } from './mobile/v2/mobile-sync.controller';
import { RolePodManualController } from './web/web-role-pod-manual.controller';
import {DoSmdController} from './master/do-smd.controller';
import {PaymentProviderController} from './mobile/mobile-payment-provider.controller';
import { V1CombinePackageController } from './web/v1/combine-package.controller';
import { V1WebAwbCodController } from './web/v1/web-awb-cod.controller';
import { V1WebAwbCodVoucherController } from './web/v1/web-awb-cod-voucher.controller';
import { TransactionStatusController } from './master/transaction-status.controller';
import { BankAccountController } from './master/bank-account.controller';
import { PackageTypeController } from './master/package-type.controller';
import { CodUserToBranchController } from './master/cod-user-to-branch.controller';
import { WebHubReportController } from './web/web-hub-report.controller';
import { V2CodPaymentController } from './mobile/v2/mobile-cod-payment.controller';
import { MobileDeviceInfoController } from './mobile/mobile-device-info.controller';
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
    MasterPartnerController,
    PrintController,
    PrintByStoreController,
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
    V1MobileSyncController,
    V2MobileSyncController,
    V1MobileAttendanceController,
    WebHubController,
    V1WebTrackingController,
    SmsTrackingController,
    RolePodManualController,
    DoSmdController,
    PaymentProviderController,
    V2CodPaymentController,
    V1CombinePackageController,
    V1WebAwbCodController,
    V1WebAwbCodVoucherController,
    TransactionStatusController,
    BankAccountController,
    PackageTypeController,
    CodUserToBranchController,
    WebHubReportController,
    MobileDeviceInfoController,
  ],
})
export class MainServerControllersModule {}
