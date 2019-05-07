import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  OneToOne,
} from 'typeorm';

import { User } from './user';
import { Role } from './role';
import { Branch } from './branch';

@Entity('user_role', { schema: 'public' })
export class UserRole extends BaseEntity {
  @Column('bigint', {
    nullable: false,
  })
  user_id: string;

  @ManyToOne(() => User)
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'user_id',
  })
  users: User[];

  @Column('bigint', {
    nullable: false,
  })
  role_id: string;

  @Column('bigint', {
    nullable: false,
  })
  user_id_created: string;

  @Column('timestamp without time zone', {
    nullable: false,
  })
  created_time: Date;

  @Column('bigint', {
    nullable: false,
  })
  user_id_updated: string;

  @Column('timestamp without time zone', {
    nullable: false,
  })
  updated_time: Date;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
  })
  is_deleted: boolean;

  @Column('bigint', {
    nullable: false,
    default: () => '1',
  })
  branch_id: string;

  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  user_role_id: string;

  // relation model
  @OneToOne(() => Branch, branch => branch, { eager: false })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  // @ManyToOne(type => User, user => user.userRoles, {})
  // @JoinColumn({ name: 'user_id' })
  // userId: User | null;

  @OneToOne(() => Role, role => role, { eager: false })
  @JoinColumn({ name: 'role_id' })
  role: Role;
}
