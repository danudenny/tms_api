import { Module } from '@nestjs/common';

import { OrmRepositoryModule } from '../../../shared/orm-repository/orm-repository.module';
import { SharedModule } from '../../../shared/shared.module';
import { BranchService } from './master/branch.services';
import { EmployeeService } from './master/employee.services';
import { MobileDeliveryService } from './mobile/delivery.service';
import { WebDeliveryService } from './web/delivery.service';
import { DashboardService } from './mobile/dashboard.service';
import { RedeliveryService } from './mobile/redelivery.services';
import { GabunganService } from './resi gabungan/gabunganservice';

@Module({
  imports: [OrmRepositoryModule, SharedModule],
  providers: [MobileDeliveryService, BranchService, EmployeeService, WebDeliveryService, DashboardService,RedeliveryService,GabunganService],
  exports: [MobileDeliveryService, BranchService, EmployeeService, WebDeliveryService, DashboardService,RedeliveryService,GabunganService],
})
export class MainServerServicesModule {}
