import { Column, Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';

import { TmsBaseEntity } from './tms-base';
import { Branch } from './branch';
import { Attachment } from './attachment';
import { User } from './user';

@Entity('employee', { schema: 'public' })
export class Employee extends TmsBaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'employee_id',
  })
  employeeId: number;

  @Column('bigint', {
    nullable: true,
    name: 'employee_type_id',
  })
  employeeTypeId: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'employee_role_id',
  })
  employeeRoleId: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'department_id',
  })
  departmentId: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'attachment_id',
  })
  attachmentId: number | null;

  @Column('character varying', {
    nullable: false,
    length: 255,
  })
  nik: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'fullname',
  })
  employeeName: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
  })
  nickname: string;

  @Column('character varying', {
    nullable: false,
    length: 500,
  })
  email1: string;

  @Column('character varying', {
    nullable: true,
    length: 500,
  })
  email2: string | null;

  @Column('character varying', {
    nullable: false,
    length: 100,
  })
  phone1: string;

  @Column('character varying', {
    nullable: true,
    length: 100,
  })
  phone2: string | null;

  @Column('character varying', {
    nullable: true,
    length: 100,
  })
  mobile1: string | null;

  @Column('character varying', {
    nullable: true,
    length: 100,
  })
  mobile2: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'district_id_home',
  })
  districtIdHome: number | null;

  @Column('text', {
    nullable: true,
    name: 'home_address',
  })
  homeAddress: string | null;

  @Column('character varying', {
    nullable: true,
    length: 50,
    name: 'zip_code_home',
  })
  zipCodeHome: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'district_id_id_card',
  })
  districtIdIdCard: number | null;

  @Column('text', {
    nullable: true,
    name: 'id_card_address',
  })
  idCardAddress: string | null;

  @Column('character varying', {
    nullable: true,
    length: 50,
    name: 'zip_code_id_card',
  })
  zipCodeIdCard: string | null;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'date_of_entry',
  })
  dateOfEntry: Date;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'date_of_resign',
  })
  dateOfResign: Date | null;

  @Column('bigint', {
    nullable: true,
    name: 'employee_id_manager',
  })
  employeeIdManager: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'employee_id_coach',
  })
  employeeIdCoach: number | null;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_manager',
  })
  isManager: boolean;

  @Column('bigint', {
    nullable: true,
    name: 'country_id_nationality',
  })
  countryIdNationality: number | null;

  @Column('character varying', {
    nullable: true,
    length: 100,
    name: 'identification_number',
  })
  identificationNumber: string | null;

  @Column('character varying', {
    nullable: true,
    length: 100,
    name: 'driver_license_a',
  })
  driverLicenseA: string | null;

  @Column('character varying', {
    nullable: true,
    length: 100,
    name: 'driver_license_c',
  })
  driverLicenseC: string | null;

  @Column('character varying', {
    nullable: true,
    length: 100,
    name: 'passport_number',
  })
  passportNumber: string | null;

  @Column('character varying', {
    nullable: true,
    length: 100,
    name: 'npwp_number',
  })
  npwpNumber: string | null;

  @Column('character varying', {
    nullable: true,
    length: 50,
  })
  religion: string | null;

  @Column('character varying', {
    nullable: true,
    length: 50,
  })
  gender: string | null;

  @Column('character varying', {
    nullable: true,
    length: 50,
    name: 'marital_status',
  })
  maritalStatus: string | null;

  @Column('integer', {
    nullable: true,
    name: 'number_of_child',
  })
  numberOfChild: number | null;

  @Column('timestamp without time zone', {
    nullable: true,
  })
  birthdate: Date | null;

  @Column('character varying', {
    nullable: true,
    length: 200,
    name: 'place_of_birth',
  })
  placeOfBirth: string | null;

  @Column('character varying', {
    nullable: true,
    length: 50,
    name: 'cod_position',
  })
  codPosition: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'bank_id_account',
  })
  bankIdAccount: number | null;

  @Column('character varying', {
    nullable: true,
    length: 100,
    name: 'bank_account_number',
  })
  bankAccountNumber: string | null;

  @Column('character varying', {
    nullable: true,
    length: 100,
    name: 'bank_account_name',
  })
  bankAccountName: string | null;

  @Column('integer', {
    nullable: false,
    default: () => '10',
    name: 'status_employee',
  })
  statusEmployee: number;

  @Column('bigint', {
    nullable: true,
    name: 'branch_id',
  })
  branchId: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'division_id',
  })
  divisionId: number | null;

  @OneToOne(() => Branch)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @OneToOne(() => Attachment)
  @JoinColumn({ name: 'attachment_id' })
  attachment: Attachment;

  @OneToOne(() => User)
  @JoinColumn({ name: 'employee_id', referencedColumnName: 'employeeId' })
  user: User;
}
