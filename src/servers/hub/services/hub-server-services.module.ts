import { Module } from '@nestjs/common';
import axios from 'axios';

import { BAG_SERVICE } from '../../../shared/interfaces/bag.service.interface';
import { ConfigService } from '../../../shared/services/config.service';
import {
  EXT_BAG_SVC_URL,
  ExternalBagService,
} from '../../../shared/services/external-bag.service';
import { HttpRequestAxiosService } from '../../../shared/services/http-request-axios.service';
import { SharedModule } from '../../../shared/shared.module';
import { HUB_BAG_LIST_SERVICE } from '../interfaces/bag-list.interface';
import { CHECK_AWB_SERVICE } from '../interfaces/check-awb.interface';
import { HUB_BAG_SERVICE } from '../interfaces/hub-bag.interface';
import { SORTATION_MACHINE_SERVICE } from '../interfaces/sortation-machine-service.interface';
import { DefaultBagListService } from './bag/bag-list.service';
import { DefaultHubBagService } from './bag/hub-bag.service';
import { DefaultCheckAwbService } from './check-awb/check-awb.service';
import { ExternalSortationMachineService } from './sortation-machine/sortation-machine-service';

// import { MockBagService } from './mocks/bag.service';
// import { MockSortationMachineService } from './mocks/sortation-machine.service';

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
  {
    provide: EXT_BAG_SVC_URL,
    useValue: ConfigService.get('bagService.url'),
  },
  // { provide: BAG_SERVICE, useClass: MockBagService },
  { provide: BAG_SERVICE, useClass: ExternalBagService },
  {
    provide: HUB_BAG_SERVICE,
    useClass: DefaultHubBagService,
  },
  {
    provide: HUB_BAG_LIST_SERVICE,
    useClass: DefaultBagListService,
  },
];

@Module({
  imports: [SharedModule],
  providers,
  exports: [CHECK_AWB_SERVICE, HUB_BAG_SERVICE, HUB_BAG_LIST_SERVICE],
})
export class HubServerServicesModule {}
