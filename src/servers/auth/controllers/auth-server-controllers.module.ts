import { Module } from '@nestjs/common';

import { SharedModule } from '../../../shared/shared.module';
import { AuthController } from './auth.controller';
import { AuthV2Controller } from './v2/auth-v2.controller';


@Module({
  imports: [SharedModule],
  controllers: [AuthController, AuthV2Controller],
})
export class AuthServerControllersModule {}
