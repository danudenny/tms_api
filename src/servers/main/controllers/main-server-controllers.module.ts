import { Module } from '@nestjs/common';

import { OrmRepositoryModule } from '../../../shared/orm-repository/orm-repository.module';
import { SharedModule } from '../../../shared/shared.module';
import { BranchController } from './branch.controller';

@Module({
  imports: [OrmRepositoryModule, SharedModule],
  controllers: [
    BranchController,
  ],
})
export class MainServerControllersModule {}
