import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users', { schema: 'public' })
export class Users extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'user_id',
  })
  userId: string;

  @Column('bigint', {
    nullable: true,
    name: 'employee_id',
  })
  employeeId: string | null;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'first_name',
  })
  firstName: string;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'last_name',
  })
  lastName: string | null;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'username',
  })
  username: string;

  @Column('character varying', {
    nullable: false,
    length: 500,
    name: 'password',
  })
  password: string;

  @Column('integer', {
    nullable: true,
    name: 'login_count',
  })
  loginCount: number | null;

  @Column('integer', {
    nullable: true,
    name: 'login_attempt_error',
  })
  loginAttemptError: number | null;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'last_login',
  })
  lastLogin: Date | null;

  @Column('bigint', {
    nullable: false,
    name: 'user_id_created',
  })
  userIdCreated: string;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'created_time',
  })
  createdTime: Date;

  @Column('bigint', {
    nullable: false,
    name: 'user_id_updated',
  })
  userIdUpdated: string;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'updated_time',
  })
  updatedTime: Date;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_deleted',
  })
  isDeleted: boolean;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'email',
  })
  email: string | null;

  @Column('character varying', {
    nullable: true,
    length: 500,
    name: 'password_reset',
  })
  passwordReset: string | null;

  @Column('character varying', {
    nullable: true,
    length: 500,
    name: 'otp_reset',
  })
  otpReset: string | null;
}
