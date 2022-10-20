import { Module } from '@nestjs/common';

import { SharedModule } from '../../../shared/shared.module';
import { SANITY_SERVICE } from '../interfaces/sanity.service';
import DefaultSanityService from './sanity/sanity.service';

const providers = [{ provide: SANITY_SERVICE, useClass: DefaultSanityService }];
@Module({
  imports: [SharedModule],
  providers,
  exports: [SANITY_SERVICE],
})
export class HubServerServicesModule {}
