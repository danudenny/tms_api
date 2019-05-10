import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// import { Province } from './province';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      // Province,
    ]),
  ],
  exports: [
    TypeOrmModule,
  ],
})
export class OrmEntityModule {}
