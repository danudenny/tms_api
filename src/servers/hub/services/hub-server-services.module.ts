import { Module } from '@nestjs/common';

import { SharedModule } from '../../../shared/shared.module';
import { CHECK_AWB_SERVICE } from '../interfaces/check-awb.interface';
import { DefaultCheckAwbService } from './check-awb/check-awb.service';

const providers = [
  { provide: CHECK_AWB_SERVICE, useClass: DefaultCheckAwbService },
];

@Module({
  imports: [SharedModule],
  providers,
  exports: [CHECK_AWB_SERVICE],
})
export class HubServerServicesModule {}
