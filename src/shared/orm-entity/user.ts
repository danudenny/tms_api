import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Employee } from './employee';
import { Role } from './role';
import { UserRole } from './user-role';

@Entity('users', { schema: 'public' })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'user_id',
  })
  userId: number;

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
  userIdCreated: number;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'created_time',
  })
  createdTime: Date;

  @Column('bigint', {
    nullable: false,
    name: 'user_id_updated',
  })
  userIdUpdated: number;

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

  @OneToMany(() => UserRole, e => e.user, {
    cascade: ['insert'],

  })
  userRoles: UserRole[];

  // relation model
  // TODO: need review
  @ManyToMany(() => Role, {
    eager: false,
    onDelete: 'CASCADE',
    cascade: true,
  })
  @JoinTable({
    name: 'user_role',
    joinColumns: [{ name: 'user_id'}],
    inverseJoinColumns: [{ name: 'role_id' }],
  })
  roles: Role[];

  @OneToOne(() => Employee, employee => employee, { eager: true , nullable: true})
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  // TODO: mapping for join on scaninlist
  // @OneToOne(() => PodScan)
  // @JoinColumn({ name: 'user_id', referencedColumnName: 'user_id' })
  // pod_scan: PodScan;

  // additional method
  validatePassword(passwordToValidate: string) {
    const crypto = require('crypto');
    const hashPass = crypto.createHash('md5').update(passwordToValidate).digest('hex');
    // compare md5 hash password
    return hashPass === this.password;
  }
}
