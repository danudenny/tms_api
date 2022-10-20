import { Module } from '@nestjs/common';

import { SharedModule } from '../../../shared/shared.module';
import { CHECK_AWB_SERVICE } from '../interfaces/check-awb.interface';
import { SORTATION_MACHINE_SERVICE } from '../interfaces/sortation-machine-service.interface';
import { DefaultCheckAwbService } from './check-awb/check-awb.service';
// import { ExternalSortationService } from './check-awb/external-sortation-service';
import { MockSortationMachineService } from './mocks/sortation-machine.service';

const providers = [
  { provide: SORTATION_MACHINE_SERVICE, useClass: MockSortationMachineService },
  // { provide: SORTATION_MAHCINE_SERVICE, useClass: ExternalSortationMachineService },
  { provide: CHECK_AWB_SERVICE, useClass: DefaultCheckAwbService },
];

@Module({
  imports: [SharedModule],
  providers,
  exports: [CHECK_AWB_SERVICE],
})
export class HubServerServicesModule { }
