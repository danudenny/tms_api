import { Module } from '@nestjs/common';

import { SharedModule } from '../../../shared/shared.module';
import { SANITY_SERVICE } from '../interfaces/sanity.service';
import DefaultSanityService from './sanity/sanity.service';
import {HttpRequestAxiosService} from '../../../shared/services/http-request-axios.service';
import axios from 'axios';
// import {DefaultSortationExternalModulesService} from './sortation/web/sortation-external-modules.service';
import {SORTATION_EXTERNAL_MODULE_SERVICE} from '../interfaces/sortation-external-modules.service';
import {MockSortationExternalModuleService} from './mock/mock-sortation-external-module.service';
import {SortationL2ModuleService} from './sortation/web/sortation-l2-module.service';

const providers = [
    { provide: SANITY_SERVICE, useClass: DefaultSanityService },
    { provide: HttpRequestAxiosService, useFactory: () => new HttpRequestAxiosService(axios.create())},
    {
        provide: SORTATION_EXTERNAL_MODULE_SERVICE,
        useClass: MockSortationExternalModuleService,
        // useClass: DefaultSortationExternalModulesService
    },
    SortationL2ModuleService,
];
@Module({
  imports: [SharedModule],
  providers,
  exports: [SANITY_SERVICE, SORTATION_EXTERNAL_MODULE_SERVICE, SortationL2ModuleService],
})
export class HubServerServicesModule {}
