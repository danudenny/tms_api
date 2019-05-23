import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BranchRepository } from './branch.repository';
import { UserRepository } from './user.repository';
import { awbRepository } from './MobileDelivery.repository';
import { Awb } from '../orm-entity/awb';
import { podScan } from '../orm-entity/pod-scan';
import { Employee } from '../orm-entity/employee';
import { employeeRepository } from './employee.respository';
import { ReasonRepository } from './reason.respository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BranchRepository,
      UserRepository,
      awbRepository,
      Awb,
      Employee,
      employeeRepository,
      awbRepository,
      ReasonRepository,
      podScan,
    ]),
  ],
  exports: [
    TypeOrmModule,
  ],
})
export class OrmRepositoryModule {}
