import { Module } from '@nestjs/common';

import { OrmRepositoryModule } from '../../../shared/orm-repository/orm-repository.module';
import { SharedModule } from '../../../shared/shared.module';
import { Branch } from '../../../shared/orm-entity/branch';

@Module({
  imports: [OrmRepositoryModule, SharedModule,],
  providers: [Branch],
  exports: [Branch],
})
export class MainServerServicesModule {}
