import { Module } from '@nestjs/common';
import { ConfigService } from '../../../shared/services/config.service';

import { SharedModule } from '../../../shared/shared.module';
import { IFRAME_CONFIG } from '../interfaces/iframe.service';
import { SANITY_SERVICE } from '../interfaces/sanity.service';
import { IframeService } from './iframe/iframe.service';
import DefaultSanityService from './sanity/sanity.service';

const providers = [
  { provide: SANITY_SERVICE, useClass: DefaultSanityService },
  { provide: IFRAME_CONFIG, useValue: ConfigService.get('iframe') },
  IframeService,
];
@Module({
  imports: [SharedModule],
  providers,
  exports: [
    SANITY_SERVICE,
    IframeService,
  ],
})
export class HubServerServicesModule {}
