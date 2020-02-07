import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToMany,
} from 'typeorm';

import { Branch } from './branch';
import { User } from './user';
import { TmsBaseEntity } from './tms-base';
import { KorwilTransaction } from './korwil-transaction';

@Entity('user_to_branch', { schema: 'public' })
export class UserToBranch extends TmsBaseEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'user_to_branch_id',
  })
  userToBranchId: number;

  @Column('bigint', {
    nullable: false,
    name: 'ref_user_id',
  })
  reUserId: number | null;

  @Column('bigint', {
    nullable: false,
    name: 'ref_branch_id',
  })
  refBranchId: number | null;

  // @OneToMany(() => Branch, e => e.branchId, { cascade: ['insert'] })
  // @JoinColumn({
  //   name: 'ref_branch_id',
  //   referencedColumnName: 'branchId',
  // })
  // branches: Branch[];

  // @OneToMany(() => Branch, e => e.branchId)
  // branches: Branch[];

  @OneToMany(() => User, e => e.userId)
  users: User[];

  @OneToMany(() => KorwilTransaction, e => e.userToBranch)
  @JoinColumn({ name: 'user_to_branch_id' })
  korwilTransaction: KorwilTransaction[];
}
