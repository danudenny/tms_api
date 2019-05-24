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
import { AwbTrouble } from '../orm-entity/awb-trouble';
import { AwbSolution } from '../orm-entity/awb-solution';
import { PartnerLogistic } from '../orm-entity/partner-logistic';
import { employeeJourney } from '../orm-entity/employee-journey';

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
      AwbTrouble,
      AwbSolution,
      PartnerLogistic,
      employeeJourney,

    ]),
  ],
  exports: [
    TypeOrmModule,
  ],
})
export class OrmRepositoryModule {}
