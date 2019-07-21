import { Module } from '@nestjs/common';

import { OrmRepositoryModule } from '../../../shared/orm-repository/orm-repository.module';
import { SharedModule } from '../../../shared/shared.module';

@Module({
  imports: [OrmRepositoryModule, SharedModule],
})
export class QueueServerServicesModule {}
