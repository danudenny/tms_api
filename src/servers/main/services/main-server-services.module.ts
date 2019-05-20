import { Module } from '@nestjs/common';

import { OrmRepositoryModule } from '../../../shared/orm-repository/orm-repository.module';
import { SharedModule } from '../../../shared/shared.module';
import { mobiledeliveryService } from './Mobile/mobile.delivery.services';
import { branchService } from './master/branch.services';
import { employeeService } from './master/employee.services';

@Module({
  imports: [OrmRepositoryModule, SharedModule,],
  providers: [mobiledeliveryService,branchService,employeeService],
  exports: [mobiledeliveryService,branchService,employeeService],
})
export class MainServerServicesModule {}
