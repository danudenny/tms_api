import { BaseEntity, Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('awb_price', { schema: 'public' })
@Index('awb_price_awb_date_idx', ['awb_date'])
@Index('awb_price_awb_number_idx', ['awb_number'])
@Index('awb_price_customer_account_id_idx', ['customer_account_id'])
@Index('awb_price_from_to_id_idx', ['from_id', 'to_id'])
@Index('awb_price_updated_time_idx', ['updated_time'])
export class AwbPrice extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  awb_price_id: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
  })
  awb_number: string;

  @Column('timestamp without time zone', {
    nullable: true,
  })
  awb_date: Date | null;

  @Column('bigint', {
    nullable: true,
  })
  customer_account_id: string | null;

  @Column('bigint', {
    nullable: true,
  })
  package_type_id: string | null;

  @Column('integer', {
    nullable: true,
  })
  from_type: number | null;

  @Column('bigint', {
    nullable: true,
  })
  from_id: string | null;

  @Column('integer', {
    nullable: true,
  })
  to_type: number | null;

  @Column('bigint', {
    nullable: true,
  })
  to_id: string | null;

  @Column('numeric', {
    nullable: true,
    default: () => '0',
    precision: 20,
    scale: 5,
  })
  disc_percent: string | null;

  @Column('numeric', {
    nullable: true,
    default: () => '0',
    precision: 20,
    scale: 5,
  })
  disc_value: string | null;

  @Column('numeric', {
    nullable: true,
    default: () => '0',
    precision: 20,
    scale: 5,
  })
  fix_price_disc: string | null;

  @Column('numeric', {
    nullable: true,
    default: () => '0',
    precision: 20,
    scale: 5,
  })
  amount: string | null;

  @Column('numeric', {
    nullable: true,
    default: () => '0',
    precision: 20,
    scale: 5,
  })
  final_amount: string | null;

  @Column('numeric', {
    nullable: false,
    default: () => '0',
    precision: 20,
    scale: 5,
  })
  total_weight_real: string;

  @Column('numeric', {
    nullable: false,
    default: () => '0',
    precision: 20,
    scale: 5,
  })
  total_weight_final_rounded: string;

  @Column('numeric', {
    nullable: false,
    default: () => '0',
    precision: 20,
    scale: 5,
  })
  grand_total_sell_price: string;

  @Column('numeric', {
    nullable: false,
    default: () => '0',
    precision: 20,
    scale: 5,
  })
  insurance: string;

  @Column('numeric', {
    nullable: false,
    default: () => '0',
    precision: 20,
    scale: 5,
  })
  insurance_admin: string;

  @Column('numeric', {
    nullable: false,
    default: () => '0',
    precision: 20,
    scale: 5,
  })
  total_insurance: string;

  @Column('numeric', {
    nullable: false,
    default: () => '0',
    precision: 20,
    scale: 5,
  })
  cod_value: string;

  @Column('character varying', {
    nullable: true,
    length: 255,
  })
  ref_table: string | null;

  @Column('bigint', {
    nullable: true,
  })
  ref_id: string | null;

  @Column('bigint', {
    nullable: true,
  })
  branch_id: string | null;

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

  @Column('character varying', {
    nullable: true,
    length: 500,
  })
  consignee_title: string | null;

  @Column('character varying', {
    nullable: true,
    length: 500,
  })
  consignee_name: string | null;

  @Column('text', {
    nullable: true,
  })
  consignee_address: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
  })
  consignee_phone: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
  })
  consignee_zip: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
  })
  consignee_district: string | null;

  @Column('bigint', {
    nullable: true,
  })
  district_id_consignee: string | null;

  @Column('timestamp without time zone', {
    nullable: true,
  })
  calculate_date: Date | null;

  @Column('bigint', {
    nullable: false,
  })
  awb_booking_id: string;

  @Column('bigint', {
    nullable: true,
  })
  invoice_id: string | null;

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
  ref_awb_number_jne: string | null;

  @Column('boolean', {
    nullable: true,
    default: () => 'false',
  })
  is_jne: boolean | null;

  @Column('character varying', {
    nullable: true,
    length: 3,
  })
  ref_representative_code: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
  })
  pickup_merchant: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
  })
  email_merchant: string | null;
}
