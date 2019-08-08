import { Module } from '@nestjs/common';

import { JwtModule } from '../modules/jwt.module';
import { OrmRepositoryModule } from '../orm-repository/orm-repository.module';
import { AuthService } from './auth.service';

// import { CloudStorageService } from './cloud-storage.service';

@Module({
  imports: [JwtModule, OrmRepositoryModule],
  providers: [
    AuthService,
  ],
  exports: [
    AuthService,
  ],
})
export class ServicesModule {}
