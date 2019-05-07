import { Module, Controller } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { OrmRepositoryModule } from '../../../shared/orm-repository/orm-repository.module';
import { SharedModule } from '../../../shared/shared.module';

@Module({
  imports: [OrmRepositoryModule, SharedModule],
  controllers: [AuthController],
})
export class AuthServerControllersModule {}
