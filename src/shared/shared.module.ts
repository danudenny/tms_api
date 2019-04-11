import { Module } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GuardsModule } from './guards/guards.module';
import { MiddlewaresModule } from './middlewares/middlewares.module';
import { JwtModule } from './modules/jwt.module';
import { OrmEntityModule } from './orm-entity/orm-entity.module';
import { OrmRepositoryModule } from './orm-repository/orm-repository.module';
import { SharedInjectorService } from './services/shared-injector.service';

@Module({
  imports: [
    JwtModule,
    TypeOrmModule.forRoot({
      keepConnectionAlive: true,
    }),
    OrmEntityModule,
    OrmRepositoryModule,
    MiddlewaresModule,
    GuardsModule,
  ],
  exports: [
    JwtModule,
    TypeOrmModule,
    OrmEntityModule,
    OrmRepositoryModule,
    MiddlewaresModule,
    GuardsModule,
  ],
})
export class SharedModule {
  constructor(
    private readonly moduleRef: ModuleRef,
  ) {
    SharedInjectorService.setModuleRef(this.moduleRef);
  }
}
