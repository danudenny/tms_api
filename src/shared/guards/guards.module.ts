import { Module } from '@nestjs/common';

import { JwtModule } from '../modules/jwt.module';
import { OrmRepositoryModule } from '../orm-repository/orm-repository.module';
import { ServicesModule } from '../services/services.module';
import { AuthenticatedGuard } from './authenticated.guard';
import { RoleAuthGuard } from './role.guard';

@Module({
  imports: [
    JwtModule,
    ServicesModule,
    OrmRepositoryModule,
  ],
  providers: [
    AuthenticatedGuard,
    RoleAuthGuard,
  ],
  exports: [
    AuthenticatedGuard,
    RoleAuthGuard,
  ],
})
export class GuardsModule {}
