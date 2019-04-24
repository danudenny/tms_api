import { BaseEntity, Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { PackagePriceSpecial } from './package-price-special';

@Entity('customer_account', { schema: 'public' })
@Index('code_rds_idx', ['code_rds'])
@Index(
  'customer_account_customer_account_code_key',
  ['customer_account_code'],
  { unique: true },
)
@Index('customer_account_is_email_at_night_idx', ['is_email_at_night'])
export class CustomerAccount extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  customer_account_id: string;

  @Column('bigint', {
    nullable: false,

  })
  customer_id: string;

  @Column('bigint', {
    nullable: false,

  })
  customer_category_id: string;

  @Column('bigint', {
    nullable: false,

  })
  customer_grade_id: string;

  @Column('character varying', {
    nullable: false,
    unique: true,
    length: 255,

  })
  customer_account_code: string;

  @Column('character varying', {
    nullable: false,
    length: 255,

  })
  customer_account_name: string;

  @Column('character varying', {
    nullable: true,
    length: 500,

  })
  phone1: string | null;

  @Column('character varying', {
    nullable: true,
    length: 500,

  })
  phone2: string | null;

  @Column('character varying', {
    nullable: true,
    length: 500,

  })
  mobile1: string | null;

  @Column('character varying', {
    nullable: true,
    length: 500,

  })
  mobile2: string | null;

  @Column('character varying', {
    nullable: true,
    length: 200,

  })
  email1: string | null;

  @Column('character varying', {
    nullable: true,
    length: 200,

  })
  email2: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  npwp_number: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  pic_customer: string | null;

  @Column('text', {
    nullable: true,

  })
  note: string | null;

  @Column('timestamp without time zone', {
    nullable: false,

  })
  join_date: Date;

  @Column('integer', {
    nullable: false,

  })
  term_of_payment_day: number;

  @Column('character varying', {
    nullable: true,
    length: 20,

  })
  term_of_payment_based_on: string | null;

  @Column('character varying', {
    nullable: true,
    length: 20,

  })
  pickup_time_method: string | null;

  @Column('numeric', {
    nullable: true,
    precision: 10,
    scale: 5,

  })
  disc_percent: string | null;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 5,

  })
  disc_value: string | null;

  @Column('integer', {
    nullable: false,
    default: () => '1',

  })
  status_customer_account: number;

  @Column('numeric', {
    nullable: true,
    default: () => '0',
    precision: 10,
    scale: 5,

  })
  weight_rounding_const: string | null;

  @Column('numeric', {
    nullable: true,
    default: () => '0',
    precision: 10,
    scale: 5,

  })
  weight_rounding_up_global: string | null;

  @Column('numeric', {
    nullable: true,
    default: () => '0',
    precision: 10,
    scale: 5,

  })
  weight_rounding_up_detail: string | null;

  @Column('numeric', {
    nullable: true,
    default: () => '0',
    precision: 10,
    scale: 5,

  })
  pickup_lead_time_min_days: string | null;

  @Column('numeric', {
    nullable: true,
    default: () => '0',
    precision: 10,
    scale: 5,

  })
  pickup_lead_time_max_days: string | null;

  @Column('bigint', {
    nullable: true,

  })
  employee_id_sales: string | null;

  @Column('bigint', {
    nullable: true,

  })
  employee_id_cro: string | null;

  @Column('bigint', {
    nullable: true,

  })
  employee_id_finance: string | null;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',

  })
  is_sms: boolean;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',

  })
  is_email_at_night: boolean;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',

  })
  is_confirmation_volume: boolean;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',

  })
  is_resi_back: boolean;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',

  })
  is_do_back: boolean;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',

  })
  is_photo_recipient: boolean;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',

  })
  is_photo_ktp: boolean;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',

  })
  is_sharia: boolean;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',

  })
  is_self_billing: boolean;

  @Column('bigint', {
    nullable: false,
    default: () => '0',

  })
  customer_account_id_billing: string;

  @Column('integer', {
    nullable: false,
    default: () => '0',

  })
  billing_reminder: number;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',

  })
  is_cod: boolean;

  @Column('numeric', {
    nullable: true,
    default: () => '0',
    precision: 20,
    scale: 5,

  })
  fee_per_receipt: string | null;

  @Column('numeric', {
    nullable: true,
    default: () => '0',
    precision: 10,
    scale: 5,

  })
  percent_cod_value: string | null;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',

  })
  is_land_cargo: boolean;

  @Column('numeric', {
    nullable: true,
    default: () => '0',
    precision: 10,
    scale: 5,

  })
  percent_land_cargo_discount: string | null;

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

  @Column('boolean', {
    nullable: false,
    default: () => 'false',

  })
  weight_rounding_up_global_bool: boolean;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',

  })
  weight_rounding_up_detail_bool: boolean;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',

  })
  is_force_weight_rounding: boolean;

  @Column('jsonb', {
    nullable: true,

  })
  code_rds: Object | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  username: string | null;

  @Column('character varying', {
    nullable: true,
    length: 500,

  })
  password: string | null;

  @Column('bigint', {
    nullable: true,

  })
  npwp_attachment_id: string | null;

  @Column('numeric', {
    nullable: true,
    precision: 10,
    scale: 5,

  })
  disc_jne_percent: string | null;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',

  })
  is_email_lph: boolean;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',

  })
  is_input_order_id: boolean;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',

  })
  is_load_data_from_internet: boolean;

  @Column('boolean', {
    nullable: true,

  })
  is_promo_3kg: boolean | null;

  @OneToMany(
    type => PackagePriceSpecial,
    package_price_special => package_price_special.customerAccount,
  )
  packagePriceSpecials: PackagePriceSpecial[];
}
