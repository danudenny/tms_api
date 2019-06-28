import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BranchRepository } from './branch.repository';
import { UserRepository } from './user.repository';
import { AwbRepository } from './awb.repository';
import { Awb } from '../orm-entity/awb';
import { PodScan } from '../orm-entity/pod-scan';
import { Employee } from '../orm-entity/employee';
import { EmployeeRepository } from './employee.respository';
import { ReasonRepository } from './reason.respository';
import { PodScanRepository } from './pod-scan.repository';
import { AwbTrouble } from '../orm-entity/awb-trouble';
import { AwbSolution } from '../orm-entity/awb-solution';
import { PartnerLogistic } from '../orm-entity/partner-logistic';
import { employeeJourney } from '../orm-entity/employee-journey';
import { BagRepository } from './bag.repository';
import { DoPodRepository } from './do-pod.repository';
import { BagItemRepository } from './bagItem.repository';
import { BagItemAwbRepository } from './bagItemAwb.repository';
import { CustomerRepository } from './customer.repository';
import { EmployeeJourneyRepository } from './employee-journey.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BranchRepository,
      UserRepository,
      AwbRepository,
      Awb,
      Employee,
      EmployeeRepository,
      EmployeeJourneyRepository,
      AwbRepository,
      ReasonRepository,
      PodScan,
      PodScanRepository,
      AwbTrouble,
      AwbSolution,
      PartnerLogistic,
      employeeJourney,
      BagRepository,
      DoPodRepository,
      BagRepository,
      BagItemRepository,
      BagItemAwbRepository,
      CustomerRepository,
    ]),
  ],
  exports: [
    TypeOrmModule,
  ],
})
export class OrmRepositoryModule {}
