// #region import
import { Module } from '@nestjs/common';

import { SharedModule } from '../../../shared/shared.module';
import { MainServerServicesModule } from '../services/main-server-services.module';
import { CombinePackageController } from './combine-package/combine-package.controller';
import { DoReturnController } from './do_return/do_return_controller';
import { AttachmentController } from './master/attachment.controller';
import { AwbStatusController } from './master/awb-status.controller';
import { BankAccountController } from './master/bank-account.controller';
import { BranchController } from './master/branch.controller';
import { CitiesController } from './master/cities.controller';
import { CodUserToBranchController } from './master/cod-user-to-branch.controller';
import { CustomerController } from './master/customer.controller';
import { DistrictsController } from './master/districts.controller';
import { DoReturnStatusController } from './master/do-return-status.controller';
import { DoSmdController } from './master/do-smd.controller';
import { EmployeeController } from './master/employee.controller';
import { PackageTypeController } from './master/package-type.controller';
import { PartnerLogisticController } from './master/partner-logistic.controller';
import { MasterPartnerController } from './master/partner.controller';
import { ProvincesController } from './master/provinces.controller';
import { ReasonController } from './master/reason.controller';
import { RepresentativeController } from './master/representative.controller';
import { RolePermissionController } from './master/role-permission.controller';
import { RoleController } from './master/role.controller';
import { TransactionStatusController } from './master/transaction-status.controller';
import { MobileAttendanceController } from './mobile/mobile-attendance.controller';
import { MobileAwbFilterController } from './mobile/mobile-awb-filter.controller';
import { MobileCheckInController } from './mobile/mobile-check-in.controller';
import { MobileCheckOutController } from './mobile/mobile-check-out.controller';
import { MobileDashboardController } from './mobile/mobile-dashboard.controller';
import { MobileDeliveryInController } from './mobile/mobile-delivery-in.controller';
import { MobileDeliveryOutController } from './mobile/mobile-delivery-out.controller';
import { MobileKorwilController } from './mobile/mobile-korwil.controller';
import { PaymentProviderController } from './mobile/mobile-payment-provider.controller';
import { V1MobileAttendanceController } from './mobile/v1/mobile-attendance.controller';
import { V1MobileInitController } from './mobile/v1/mobile-init.controller';
import { V2CodPaymentController } from './mobile/v2/mobile-cod-payment.controller';
import { V2MobileSyncController } from './mobile/v2/mobile-sync.controller';
import { PrintByStoreController } from './print-by-store.controller';
import { PrintController } from './print.controller';
import { ReportPODController } from './report/report-pod.controller';
import { SmsTrackingController } from './web/sms-tracking.controller';
import { V1CombinePackageController } from './web/v1/combine-package.controller';
import { V1WebAwbCodVoucherController } from './web/v1/web-awb-cod-voucher.controller';
import { V1WebAwbCodController } from './web/v1/web-awb-cod.controller';
import { V2WebAwbCodController } from './web/v2/web-awb-cod.controller';
import { V1WebTrackingController } from './web/v1/web-tracking.controller';
import { V2WebCodReportController } from './web/v2/web-cod-report.controller';
import { WebAwbCountController } from './web/web-awb-count.controller';
import { WebAwbDeliverController } from './web/web-awb-deliver.controller';
import { WebAwbFilterController } from './web/web-awb-filter.controller';
import { WebAwbPodController } from './web/web-awb-pod.controller';
import { WebAwbReturnController } from './web/web-awb-return.controller';
import { WebAwbReturnCancelController } from './web/web-awb-return-cancel.controller';
import { WebAwbUpdateStatusController } from './web/web-awb-update-status.controller';
import { WebBagPodController } from './web/web-bag-pod.controller';
import { WebDeliveryInController } from './web/web-delivery-in.controller';
import { WebDeliveryOutController } from './web/web-delivery-out.controller';
import { WebFirstMileController } from './web/web-first-mile.controller';
import { WebHubReportController } from './web/web-hub-report.controller';
import { WebHubController } from './web/web-hub.controller';
import { WebLastMileController } from './web/web-last-mile.controller';
import { WebMonitoringController } from './web/web-monitoring.controller';
import { RolePodManualController } from './web/web-role-pod-manual.controller';
import { V1WebAwbHighValueController } from './web/v1/web-awb-high-value.controller';
import { V2MobileInitController } from './mobile/v2/mobile-init.controller';
import { V3MobileInitController } from './mobile/v3/mobile-init.controller';
import { EmployeePenalty  } from './web/v1/web-employee-penalty.controller';
import { PodProxyController } from './proxy/proxy.controller';
import { MobileDeviceInfoController } from './mobile/mobile-device-info.controller';
import { V1WebAwbHandoverController } from './web/v1/web-awb-handover.controller';
import { V1MobileSyncController } from './mobile/v1/mobile-sync.controller';
import { WebDoPodReturnController } from './web/web-do-pod-return.controller';
import { MobileDoPodReturnController } from './mobile/mobile-do-pod-return.controller';
import { RejectPackageController } from './combine-package/reject-package.controller';
import { WebAwbCodReportController } from './web/v1/web-awb-cod-report.controller';
import { WebAwbCodRedshiftController } from './web/v1/web-awb-cod-redshift.controller';
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
    WebAwbReturnCancelController,
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
    V2MobileInitController,
    V3MobileInitController,
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
    V2WebAwbCodController,
    V1WebAwbCodVoucherController,
    V2WebCodReportController,
    TransactionStatusController,
    BankAccountController,
    PackageTypeController,
    CodUserToBranchController,
    WebHubReportController,
    V1WebAwbHighValueController,
    EmployeePenalty,
    PodProxyController,
    MobileDeviceInfoController,
    V1WebAwbHandoverController,
    WebDoPodReturnController,
    MobileDoPodReturnController,
    RejectPackageController,
    WebAwbCodReportController,
    WebAwbCodRedshiftController,
  ],
})
export class MainServerControllersModule {}
