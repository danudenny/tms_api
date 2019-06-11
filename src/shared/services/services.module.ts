import { Module } from '@nestjs/common';

import { JwtModule } from '../modules/jwt.module';
import { OrmRepositoryModule } from '../orm-repository/orm-repository.module';
import { AuthService } from './auth.service';
import { BootService } from './boot.service';

@Module({
  imports: [JwtModule, OrmRepositoryModule],
  providers: [
    AuthService,
    BootService,
  ],
  exports: [
    AuthService,
    BootService,
  ],
})
export class ServicesModule {}
