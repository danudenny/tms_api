import { Module } from '@nestjs/common';

import { OrmRepositoryModule } from '../../../shared/orm-repository/orm-repository.module';
import { SharedModule } from '../../../shared/shared.module';
import { BranchService } from './master/branch.service';
import { EmployeeService } from './master/employee.service';
import { MobileDeliveryService } from './mobile/delivery.service';
import { WebDeliveryInService } from './web/web-delivery-in.service';
import { WebDeliveryOutService } from './web/web-delivery-out.service';
import { DashboardService } from './mobile/dashboard.service';
import { RedeliveryService } from './mobile/redelivery.services';
import { GabunganService } from './resi gabungan/gabungan.services';
import { CustomerService } from './master/customer.service';
import { AwbStatusService } from './master/awb-status.service';
import { ReasonService } from './master/reason.service';
import { PartnerLogisticService } from './master/partner-logistic.service';
import { RoleService } from './master/role.service';

@Module({
  imports: [OrmRepositoryModule, SharedModule],
  providers: [
    MobileDeliveryService,
    BranchService,
    EmployeeService,
    WebDeliveryInService,
    WebDeliveryOutService,
    DashboardService,
    RedeliveryService,
    GabunganService,
    CustomerService,
    AwbStatusService,
    ReasonService,
    RoleService,
    PartnerLogisticService,
  ],
  exports: [
    MobileDeliveryService,
    BranchService,
    EmployeeService,
    WebDeliveryInService,
    WebDeliveryOutService,
    DashboardService,
    RedeliveryService,
    GabunganService,
    CustomerService,
    AwbStatusService,
    ReasonService,
    RoleService,
    PartnerLogisticService,
  ],
})
export class MainServerServicesModule {}
