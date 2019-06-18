import { Module } from '@nestjs/common';

import { OrmRepositoryModule } from '../../../shared/orm-repository/orm-repository.module';
import { SharedModule } from '../../../shared/shared.module';
import { BranchService } from './master/branch.services';
import { EmployeeService } from './master/employee.services';
import { MobileDeliveryService } from './mobile/delivery.service';
import { WebDeliveryService } from './web/delivery.service';
import { WebDeliveryOutService } from './web/web-delivery-out.service';
import { DashboardService } from './mobile/dashboard.service';
import { RedeliveryService } from './mobile/redelivery.services';
import { GabunganService } from './resi gabungan/gabungan.services';
import { CustomerService } from './master/customer.services';

@Module({
  imports: [OrmRepositoryModule, SharedModule],
  providers: [
    MobileDeliveryService,
    BranchService,
    EmployeeService,
    WebDeliveryService,
    WebDeliveryOutService,
    DashboardService,
    RedeliveryService,
    GabunganService,
    CustomerService,
  ],
  exports: [
    MobileDeliveryService,
    BranchService,
    EmployeeService,
    WebDeliveryService,
    WebDeliveryOutService,
    DashboardService,
    RedeliveryService,
    GabunganService,
    CustomerService,
  ],
})
export class MainServerServicesModule {}
