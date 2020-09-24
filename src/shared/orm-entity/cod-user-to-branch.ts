import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

import { User } from './user';
import { TmsBaseEntity } from './tms-base';
import { Branch } from './branch';

@Entity('cod_user_to_branch', { schema: 'public' })
export class CodUserToBranch extends TmsBaseEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'cod_user_to_branch_id',
  })
  codUserToBranchId: string;

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

  @ManyToOne(() => Branch, branch => branch)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @ManyToOne(() => User, e => e.userRoles)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
