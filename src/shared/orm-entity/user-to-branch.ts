import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';

import { Branch } from './branch';
import { User } from './user';

@Entity('user_to_branch', { schema: 'public' })
export class UserToBranch extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
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

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'created_time',
  })
  createdTime: Date;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_deleted',
  })
  isDeleted: boolean;

  // @OneToMany(() => Branch, e => e.branchId, { cascade: ['insert'] })
  // @JoinColumn({
  //   name: 'ref_branch_id',
  //   referencedColumnName: 'branchId',
  // })
  // branches: Branch[];

  // @OneToMany(() => Branch, e => e.branchId)
  // branches: Branch[];

  // @OneToMany(() => User, e => e.userId)
  // users: User[];
}
