import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, OneToMany, OneToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { UserRole } from './user-role';
import { Employee } from './employee';
import { Role } from './role';
import { PodScan } from './pod-scan';

@Entity('users', { schema: 'public' })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  user_id: number;

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
