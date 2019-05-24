import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BranchRepository } from './branch.repository';
import { UserRepository } from './user.repository';
import { AwbRepository } from './mobile-delivery.repository';
import { Awb } from '../orm-entity/awb';
import { podScan } from '../orm-entity/pod-scan';
import { Employee } from '../orm-entity/employee';
import { EmployeeRepository } from './employee.respository';
import { ReasonRepository } from './reason.respository';
import { PodScanRepository } from './pod-scan.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BranchRepository,
      UserRepository,
      AwbRepository,
      Awb,
      Employee,
      EmployeeRepository,
      AwbRepository,
      ReasonRepository,
      podScan,
      PodScanRepository,
    ]),
  ],
  exports: [
    TypeOrmModule,
  ],
})
export class OrmRepositoryModule {}
