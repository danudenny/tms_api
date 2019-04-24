import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';

@Entity('employee', { schema: 'public' })
export class Employee extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  employee_id: string;

  @Column('bigint', {
    nullable: true,

  })
  employee_type_id: string | null;

  @Column('bigint', {
    nullable: true,

  })
  employee_role_id: string | null;

  @Column('bigint', {
    nullable: true,

  })
  department_id: string | null;

  @Column('bigint', {
    nullable: true,

  })
  attachment_id: string | null;

  @Column('character varying', {
    nullable: false,
    length: 255,

  })
  nik: string;

  @Column('character varying', {
    nullable: false,
    length: 255,

  })
  fullname: string;

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

  })
  district_id_home: string | null;

  @Column('text', {
    nullable: true,

  })
  home_address: string | null;

  @Column('character varying', {
    nullable: true,
    length: 50,

  })
  zip_code_home: string | null;

  @Column('bigint', {
    nullable: true,

  })
  district_id_id_card: string | null;

  @Column('text', {
    nullable: true,

  })
  id_card_address: string | null;

  @Column('character varying', {
    nullable: true,
    length: 50,

  })
  zip_code_id_card: string | null;

  @Column('timestamp without time zone', {
    nullable: false,

  })
  date_of_entry: Date;

  @Column('timestamp without time zone', {
    nullable: true,

  })
  date_of_resign: Date | null;

  @Column('bigint', {
    nullable: true,

  })
  employee_id_manager: string | null;

  @Column('bigint', {
    nullable: true,

  })
  employee_id_coach: string | null;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',

  })
  is_manager: boolean;

  @Column('bigint', {
    nullable: true,

  })
  country_id_nationality: string | null;

  @Column('character varying', {
    nullable: true,
    length: 100,

  })
  identification_number: string | null;

  @Column('character varying', {
    nullable: true,
    length: 100,

  })
  driver_license_a: string | null;

  @Column('character varying', {
    nullable: true,
    length: 100,

  })
  driver_license_c: string | null;

  @Column('character varying', {
    nullable: true,
    length: 100,

  })
  passport_number: string | null;

  @Column('character varying', {
    nullable: true,
    length: 100,

  })
  npwp_number: string | null;

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

  })
  marital_status: string | null;

  @Column('integer', {
    nullable: true,

  })
  number_of_child: number | null;

  @Column('timestamp without time zone', {
    nullable: true,

  })
  birthdate: Date | null;

  @Column('character varying', {
    nullable: true,
    length: 200,

  })
  place_of_birth: string | null;

  @Column('character varying', {
    nullable: true,
    length: 50,

  })
  cod_position: string | null;

  @Column('bigint', {
    nullable: true,

  })
  bank_id_account: string | null;

  @Column('character varying', {
    nullable: true,
    length: 100,

  })
  bank_account_number: string | null;

  @Column('character varying', {
    nullable: true,
    length: 100,

  })
  bank_account_name: string | null;

  @Column('integer', {
    nullable: false,
    default: () => '10',

  })
  status_employee: number;

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
    nullable: true,

  })
  branch_id: string | null;

  @Column('bigint', {
    nullable: true,

  })
  division_id: string | null;
}
