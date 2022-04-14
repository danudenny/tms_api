import { Module, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GuardsModule } from './guards/guards.module';
import { MiddlewaresModule } from './middlewares/middlewares.module';
import { JwtModule } from './modules/jwt.module';
import { OrmEntityModule } from './orm-entity/orm-entity.module';
import { OrmRepositoryModule } from './orm-repository/orm-repository.module';
import { BootService } from './services/boot.service';
import { ServicesModule } from './services/services.module';
import { SharedInjectorService } from './services/shared-injector.service';
import { SlackModule } from 'nestjs-slack';
@Module({
  imports: [
    GuardsModule,
    JwtModule,
    MiddlewaresModule,
    OrmEntityModule,
    OrmRepositoryModule,
    ServicesModule,
    TypeOrmModule.forRoot({
      keepConnectionAlive: true,
    }),
    SlackModule.forRoot({
      type : 'webhook',
      webhookOptions: {
        url: 'https://hooks.slack.com/services/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',
      },
    }),
  ],
  exports: [
    GuardsModule,
    JwtModule,
    MiddlewaresModule,
    OrmEntityModule,
    OrmRepositoryModule,
    ServicesModule,
    TypeOrmModule,
    SlackModule,
  ],
})
export class SharedModule implements OnModuleInit {
  constructor(
    private readonly moduleRef: ModuleRef,
  ) {}

  async onModuleInit() {
    SharedInjectorService.setModuleRef(this.moduleRef);
    await BootService.boot();
  }
}
