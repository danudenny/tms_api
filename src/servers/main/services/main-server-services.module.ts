import { Module } from '@nestjs/common';

import { OrmRepositoryModule } from '../../../shared/orm-repository/orm-repository.module';
import { SharedModule } from '../../../shared/shared.module';
import { Branch } from '../../../shared/orm-entity/branch';
import { mobiledeliveryService } from './Mobile/mobile.delivery.services';

@Module({
  imports: [OrmRepositoryModule, SharedModule,],
  providers: [Branch,mobiledeliveryService],
  exports: [Branch,mobiledeliveryService],
})
export class MainServerServicesModule {}
