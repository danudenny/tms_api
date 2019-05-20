import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BranchRepository } from './branch.repository';
import { UserRepository } from './user.repository';
import { awbRepository } from './MobileDelivery.repository';
import { Awb } from '../orm-entity/awb';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BranchRepository,
      UserRepository,
      awbRepository,
      Awb,
    ]),
  ],
  exports: [
    TypeOrmModule,
  ],
})
export class OrmRepositoryModule {}
