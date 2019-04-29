import { Module } from '@nestjs/common';

import { OrmRepositoryModule } from '../../../shared/orm-repository/orm-repository.module';
import { SharedModule } from '../../../shared/shared.module';
import { AuthController } from './auth.controller';

@Module({
  imports: [OrmRepositoryModule, SharedModule],
  controllers: [AuthController],
})
export class AuthServerControllersModule {}
