import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Users } from './users';

@Entity('user_role', { schema: 'public' })
export class UserRole extends BaseEntity {
  @Column('bigint', {
    nullable: false,
  })
  user_id: string;

  @ManyToOne(() => Users)
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'user_id',
  })
  users: Users[];

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
}
