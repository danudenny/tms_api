import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BranchRepository } from './branch.repository';
import { UserRepository } from './user.repository';
import { awbRepository } from './MobileDelivery.repository';
import { Awb } from '../orm-entity/awb';
import { Employee } from '../orm-entity/employee';
import { employeeRepository } from './employee.respository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BranchRepository,
      UserRepository,
      awbRepository,
      Awb,
      Employee,
      employeeRepository,
    ]),
  ],
  exports: [
    TypeOrmModule,
  ],
})
export class OrmRepositoryModule {}
