import { Module } from '@nestjs/common';

import { JwtModule } from '../modules/jwt.module';
import { OrmRepositoryModule } from '../orm-repository/orm-repository.module';
import { AuthService } from './auth.service';
import { AuthV2Service } from './v2/auth-v2.service';

// import { CloudStorageService } from './cloud-storage.service';

@Module({
  imports: [JwtModule, OrmRepositoryModule],
  providers: [
    AuthService, AuthV2Service
  ],
  exports: [
    AuthService, AuthV2Service
  ],
})
export class ServicesModule {}
