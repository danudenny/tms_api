import { Module } from '@nestjs/common';

import { JwtModule } from '../modules/jwt.module';
import { OrmRepositoryModule } from '../orm-repository/orm-repository.module';
import { ServicesModule } from '../services/services.module';
import { AuthenticatedGuard } from './authenticated.guard';
import { PermissionTokenGuard } from './permission-token.guard';
import { RoleAuthGuard } from './role.guard';

@Module({
  imports: [JwtModule, ServicesModule, OrmRepositoryModule],
  providers: [AuthenticatedGuard, PermissionTokenGuard, RoleAuthGuard],
  exports: [AuthenticatedGuard, PermissionTokenGuard, RoleAuthGuard],
})
export class GuardsModule {}
