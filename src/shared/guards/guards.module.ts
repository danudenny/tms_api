import { Module } from '@nestjs/common';

import { JwtModule } from '../modules/jwt.module';
import { OrmRepositoryModule } from '../orm-repository/orm-repository.module';
import { ServicesModule } from '../services/services.module';
import { AuthenticatedGuard } from './authenticated.guard';
import { RoleGuard } from './role.guard';

@Module({
  imports: [
    JwtModule,
    ServicesModule,
    OrmRepositoryModule,
  ],
  providers: [
    AuthenticatedGuard,
    RoleGuard,
  ],
  exports: [
    AuthenticatedGuard,
    RoleGuard,
  ],
})
export class GuardsModule {}
