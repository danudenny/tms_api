import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('employee', { schema: 'public' })
export class Employee extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'employee_id',
  })
  employeeId: string;

  @Column('bigint', {
    nullable: true,
    name: 'employee_type_id',
  })
  employeeTypeId: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'employee_role_id',
  })
  employeeRoleId: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'department_id',
  })
  departmentId: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'attachment_id',
  })
  attachmentId: string | null;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'nik',
  })
  nik: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'fullname',
  })
  fullname: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'nickname',
  })
  nickname: string;

  @Column('character varying', {
    nullable: false,
    length: 500,
    name: 'email1',
  })
  email1: string;

  @Column('character varying', {
    nullable: true,
    length: 500,
    name: 'email2',
  })
  email2: string | null;

  @Column('character varying', {
    nullable: false,
    length: 100,
    name: 'phone1',
  })
  phone1: string;

  @Column('character varying', {
    nullable: true,
    length: 100,
    name: 'phone2',
  })
  phone2: string | null;

  @Column('character varying', {
    nullable: true,
    length: 100,
    name: 'mobile1',
  })
  mobile1: string | null;

  @Column('character varying', {
    nullable: true,
    length: 100,
    name: 'mobile2',
  })
  mobile2: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'district_id_home',
  })
  districtIdHome: string | null;

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
  districtIdIdCard: string | null;

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
  employeeIdManager: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'employee_id_coach',
  })
  employeeIdCoach: string | null;

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
  countryIdNationality: string | null;

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
    name: 'religion',
  })
  religion: string | null;

  @Column('character varying', {
    nullable: true,
    length: 50,
    name: 'gender',
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
    name: 'birthdate',
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
  bankIdAccount: string | null;

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

  @Column('bigint', {
    nullable: true,
    name: 'branch_id',
  })
  branchId: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'division_id',
  })
  divisionId: string | null;
}
