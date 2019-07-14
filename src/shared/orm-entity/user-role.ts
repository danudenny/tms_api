import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Branch } from './branch';
import { Role } from './role';
import { User } from './user';

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
  role_id: number;

  @Column('bigint', {
    nullable: false,
  })
  user_id_created: number;

  @Column('timestamp without time zone', {
    nullable: false,
  })
  created_time: Date;

  @Column('bigint', {
    nullable: false,
  })
  user_id_updated: number;

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
  branch_id: number;

  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  user_role_id: number;

  // relation model
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
