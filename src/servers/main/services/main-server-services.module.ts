import { Module } from '@nestjs/common';

import { OrmRepositoryModule } from '../../../shared/orm-repository/orm-repository.module';
import { SharedModule } from '../../../shared/shared.module';
import { BranchService } from './master/branch.services';
import { EmployeeService } from './master/employee.services';
import { MobileDeliveryService } from './mobile/delivery.service';
import { WebDeliveryListService } from './web/web-delivery-list.service';
import { DashboardService } from './mobile/dashboard.service';

@Module({
  imports: [OrmRepositoryModule, SharedModule],
  providers: [MobileDeliveryService, BranchService, EmployeeService,WebDeliveryListService,DashboardService],
  exports: [MobileDeliveryService, BranchService, EmployeeService,WebDeliveryListService,DashboardService],
})
export class MainServerServicesModule {}
