import { Module } from '@nestjs/common';

import { SharedModule } from '../../../shared/shared.module';
import { CHECK_AWB_SERVICE } from '../interfaces/check-awb.interface';
import { SORTATION_SERVICE } from '../interfaces/sortation-service.interface';
import { DefaultCheckAwbService } from './check-awb/check-awb.service';
import { MockSortationService } from './mocks/sortation-service';

const providers = [
  { provide: SORTATION_SERVICE, useClass: MockSortationService },
  { provide: CHECK_AWB_SERVICE, useClass: DefaultCheckAwbService },
];

@Module({
  imports: [SharedModule],
  providers,
  exports: [CHECK_AWB_SERVICE],
})
export class HubServerServicesModule {}
