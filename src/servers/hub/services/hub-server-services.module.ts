import { Module } from '@nestjs/common';
import axios from 'axios';

import { HttpRequestAxiosService } from '../../../shared/services/http-request-axios.service';
import { SharedModule } from '../../../shared/shared.module';
import { CHECK_AWB_SERVICE } from '../interfaces/check-awb.interface';
import { SORTATION_MACHINE_SERVICE } from '../interfaces/sortation-machine-service.interface';
import { DefaultCheckAwbService } from './check-awb/check-awb.service';
import { ExternalSortationMachineService } from './sortation-machine/sortation-machine-service';

const providers = [
  {
    provide: HttpRequestAxiosService,
    useFactory: () => new HttpRequestAxiosService(axios.create()),
  },
  // { provide: SORTATION_MACHINE_SERVICE, useClass: MockSortationMachineService },
  {
    provide: SORTATION_MACHINE_SERVICE,
    useClass: ExternalSortationMachineService,
  },
  { provide: CHECK_AWB_SERVICE, useClass: DefaultCheckAwbService },
];

@Module({
  imports: [SharedModule],
  providers,
  exports: [CHECK_AWB_SERVICE],
})
export class HubServerServicesModule {}
