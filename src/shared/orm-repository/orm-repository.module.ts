import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BranchRepository } from './branch.repository';
import { UserRepository } from './user.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BranchRepository,
      UserRepository,
    ]),
  ],
  exports: [
    TypeOrmModule,
  ],
})
export class OrmRepositoryModule {}
