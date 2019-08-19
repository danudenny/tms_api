import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Branch } from './branch';
import { Role } from './role';
import { User } from './user';
import { TmsBaseEntity } from './tms-base';

@Entity('user_role', { schema: 'public' })
export class UserRole extends TmsBaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'user_role_id',
  })
  userRoleId: number;

  @Column('bigint', {
    nullable: false,
    name: 'user_id',
  })
  userId: number;

  @Column('bigint', {
    nullable: false,
    name: 'role_id',
  })
  roleId: number;

  @Column('bigint', {
    nullable: false,
    name: 'branch_id',
    default: () => '1',
  })
  branchId: number;

  // relation model
  @ManyToOne(() => User)
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'userId',
  })
  users: User[];

  @OneToOne(() => Branch, branch => branch)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @ManyToOne(() => User, e => e.userRoles)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'role_id' })
  role: Role;
}
