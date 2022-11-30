import { Module } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '../../../shared/services/config.service';
import { BAG_SERVICE } from '../../../shared/interfaces/bag.service.interface';
import {
  EXT_BAG_SVC_URL,
  ExternalBagService,
} from '../../../shared/services/external-bag.service';
import { HttpRequestAxiosService } from '../../../shared/services/http-request-axios.service';
import { SharedModule } from '../../../shared/shared.module';
import { IFRAME_CONFIG } from '../interfaces/iframe.service';
import { SANITY_SERVICE } from '../interfaces/sanity.service';
import { IframeService } from './iframe/iframe.service';
import DefaultSanityService from './sanity/sanity.service';
import { HUB_BAG_LIST_SERVICE } from '../interfaces/bag-list.interface';
import { CHECK_AWB_SERVICE } from '../interfaces/check-awb.interface';
import { HUB_BAG_SERVICE } from '../interfaces/hub-bag.interface';
import { SORTATION_MACHINE_SERVICE } from '../interfaces/sortation-machine-service.interface';
import { DefaultBagListService } from './bag/bag-list.service';
import { DefaultHubBagService } from './bag/hub-bag.service';
import { DefaultCheckAwbService } from './check-awb/check-awb.service';
import { ExternalSortationMachineService } from './sortation-machine/sortation-machine-service';

const providers = [
  { provide: SANITY_SERVICE, useClass: DefaultSanityService },
  {
    provide: HttpRequestAxiosService,
    useFactory: () => new HttpRequestAxiosService(axios.create()),
  },
  {
    provide: SORTATION_MACHINE_SERVICE,
    useClass: ExternalSortationMachineService,
  },
  {
    provide: CHECK_AWB_SERVICE,
    useClass: DefaultCheckAwbService,
  },
  {
    provide: IFRAME_CONFIG,
    useValue: ConfigService.get('iframe'),
  },
  {
    provide: EXT_BAG_SVC_URL,
    useValue: ConfigService.get('bagService.url'),
  },
  {
    provide: BAG_SERVICE,
    useClass: ExternalBagService,
  },
  {
    provide: HUB_BAG_SERVICE,
    useClass: DefaultHubBagService,
  },
  {
    provide: HUB_BAG_LIST_SERVICE,
    useClass: DefaultBagListService,
  },
  IframeService,
];

@Module({
  imports: [SharedModule],
  providers,
  exports: [
    SANITY_SERVICE,
    CHECK_AWB_SERVICE,
    IframeService,
    HUB_BAG_SERVICE,
    HUB_BAG_LIST_SERVICE,
  ],
})
export class HubServerServicesModule {}
