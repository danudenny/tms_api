import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

import { User } from './user';
import { TmsBaseEntity } from './tms-base';

@Entity('cod_user_to_branch', { schema: 'public' })
export class CodUserToBranch extends TmsBaseEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'cod_user_to_branch_id',
  })
  codUserToBranchId: number;

  @Column('bigint', {
    nullable: false,
    name: 'user_id',
  })
  userId: number;

  @Column('bigint', {
    nullable: false,
    name: 'branch_id',
  })
  branchId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'userId' })
  users: User;
}
