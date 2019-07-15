import { Module } from '@nestjs/common';

import { JwtModule } from '../modules/jwt.module';
import { OrmRepositoryModule } from '../orm-repository/orm-repository.module';
import { AuthService } from './auth.service';
import { BootService } from './boot.service';
// import { CloudStorageService } from './cloud-storage.service';

@Module({
  imports: [JwtModule, OrmRepositoryModule],
  providers: [
    AuthService,
    BootService,
    // CloudStorageService,
  ],
  exports: [
    AuthService,
    BootService,
    // CloudStorageService,
  ],
})
export class ServicesModule {}
