import { Module } from '@nestjs/common';

import { JwtModule } from '../modules/jwt.module';
import { OrmRepositoryModule } from '../orm-repository/orm-repository.module';
import { ServicesModule } from '../services/services.module';
import { AuthMiddleware } from './auth.middleware';
import { HeaderMetadataMiddleware } from './header-metadata.middleware';
import { RequestContextMiddleware } from './request-context.middleware';

@Module({
  imports: [
    JwtModule,
    OrmRepositoryModule,
    ServicesModule,
  ],
  providers: [
    AuthMiddleware,
    HeaderMetadataMiddleware,
    RequestContextMiddleware,
  ],
  exports: [
    AuthMiddleware,
    HeaderMetadataMiddleware,
    RequestContextMiddleware,
  ],
})
export class MiddlewaresModule {}
