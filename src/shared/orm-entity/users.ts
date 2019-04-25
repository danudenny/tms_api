import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { UserRole } from './user-role';
import { Employee } from './employee';

@Entity('users', { schema: 'public' })
export class Users extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  user_id: string;

  @Column('bigint', {
    nullable: true,
  })
  employee_id: string | null;

  @Column('character varying', {
    nullable: false,
    length: 255,
  })
  first_name: string;

  @Column('character varying', {
    nullable: true,
    length: 255,
  })
  last_name: string | null;

  @Column('character varying', {
    nullable: false,
    length: 255,
  })
  username: string;

  @Column('character varying', {
    nullable: false,
    length: 500,
  })
  password: string;

  @Column('integer', {
    nullable: true,
  })
  login_count: number | null;

  @Column('integer', {
    nullable: true,
  })
  login_attempt_error: number | null;

  @Column('timestamp without time zone', {
    nullable: true,
  })
  last_login: Date | null;

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

  @Column('character varying', {
    nullable: true,
    length: 255,
  })
  email: string | null;

  @Column('character varying', {
    nullable: true,
    length: 500,
  })
  password_reset: string | null;

  @Column('character varying', {
    nullable: true,
    length: 500,
  })
  otp_reset: string | null;

  @OneToMany(type => UserRole, user_role => user_role.userId)
  userRoles: UserRole[];

  @OneToOne(type => Employee)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;
}
