import { BaseEntity, Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('awb', { schema: 'public' })
@Index('awb_booking_idx', ['awb_booking_id'])
@Index('awb_awb_date_idx', ['awb_date'])
@Index('awb_awb_list_idx', ['awb_date', 'is_deleted'])
@Index('awb_awb_number_idx', ['awb_number'])
@Index('awb_awb_status_id_last_idx', ['awb_status_id_last'])
@Index('awb_branch_id_last_idx', ['branch_id_last'])
@Index('awb_customer_account_id_idx', ['customer_account_id'])
@Index('awb_from_id_idx', ['from_id'])
@Index('awb_from_type_idx', ['from_type'])
@Index('awb_is_deleted_idx', ['is_deleted'])
@Index('awb_package_type_id_idx', ['package_type_id'])
@Index('awb_to_id_idx', ['to_id'])
@Index('awb_to_type_idx', ['to_type'])
@Index('awb_updated_time_idx', ['updated_time'])
export class Awb extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  awb_id: string;

  @Column('integer', {
    nullable: false,
    default: () => '1',
  })
  awb_version: number;

  @Column('character varying', {
    nullable: false,
    length: 255,
  })
  awb_code: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
  })
  awb_number: string;

  @Column('bigint', {
    nullable: false,
  })
  awb_booking_id: string;

  @Column('character varying', {
    nullable: true,
    length: 255,
  })
  reference_code: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
  })
  ref_awb_number: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
  })
  ref_transaction_number: string | null;

  @Column('timestamp without time zone', {
    nullable: true,
  })
  awb_date: Date | null;

  @Column('timestamp without time zone', {
    nullable: true,
  })
  awb_date_real: Date | null;

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

  @Column('bigint', {
    nullable: true,
  })
  user_id: string | null;

  @Column('bigint', {
    nullable: true,
  })
  branch_id: string | null;

  @Column('bigint', {
    nullable: true,
  })
  customer_account_id: string | null;

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

  @Column('bigint', {
    nullable: true,
  })
  reseller_id: string | null;

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
    nullable: false,
    default: () => '0',
    precision: 10,
    scale: 5,
  })
  lead_time_min_days: string;

  @Column('numeric', {
    nullable: false,
    default: () => '0',
    precision: 10,
    scale: 5,
  })
  lead_time_max_days: string;

  @Column('numeric', {
    nullable: false,
    default: () => '0',
    precision: 20,
    scale: 5,
  })
  total_weight: string;

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
  total_weight_real_rounded: string;

  @Column('numeric', {
    nullable: false,
    default: () => '0',
    precision: 20,
    scale: 5,
  })
  total_weight_rounded: string;

  @Column('numeric', {
    nullable: false,
    default: () => '0',
    precision: 20,
    scale: 5,
  })
  total_weight_volume: string;

  @Column('numeric', {
    nullable: false,
    default: () => '0',
    precision: 20,
    scale: 5,
  })
  total_weight_volume_rounded: string;

  @Column('numeric', {
    nullable: false,
    default: () => '0',
    precision: 20,
    scale: 5,
  })
  total_weight_final: string;

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
  base_price: string;

  @Column('numeric', {
    nullable: false,
    default: () => '0',
    precision: 20,
    scale: 5,
  })
  disc_percent: string;

  @Column('numeric', {
    nullable: false,
    default: () => '0',
    precision: 20,
    scale: 5,
  })
  disc_value: string;

  @Column('numeric', {
    nullable: false,
    default: () => '0',
    precision: 20,
    scale: 5,
  })
  sell_price: string;

  @Column('numeric', {
    nullable: false,
    default: () => '0',
    precision: 20,
    scale: 5,
  })
  total_base_price: string;

  @Column('numeric', {
    nullable: false,
    default: () => '0',
    precision: 20,
    scale: 5,
  })
  total_disc_percent: string;

  @Column('numeric', {
    nullable: false,
    default: () => '0',
    precision: 20,
    scale: 5,
  })
  total_disc_value: string;

  @Column('numeric', {
    nullable: false,
    default: () => '0',
    precision: 20,
    scale: 5,
  })
  total_sell_price: string;

  @Column('numeric', {
    nullable: false,
    default: () => '0',
    precision: 20,
    scale: 5,
  })
  total_item_price: string;

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
  total_cod_value: string;

  @Column('bigint', {
    nullable: true,
  })
  awb_history_id_last: string | null;

  @Column('integer', {
    nullable: true,
  })
  awb_status_id_last: number | null;

  @Column('integer', {
    nullable: true,
    default: () => '2000',
  })
  awb_status_id_last_public: number | null;

  @Column('bigint', {
    nullable: true,
  })
  user_id_last: string | null;

  @Column('bigint', {
    nullable: true,
  })
  branch_id_last: string | null;

  @Column('integer', {
    nullable: false,
    default: () => '0',
  })
  lead_time_run_days: number;

  @Column('timestamp without time zone', {
    nullable: true,
  })
  history_date_last: Date | null;

  @Column('timestamp without time zone', {
    nullable: true,
  })
  final_status_date: Date | null;

  @Column('integer', {
    nullable: true,
  })
  awb_status_id_final: number | null;

  @Column('integer', {
    nullable: false,
    default: () => '0',
  })
  lead_time_final_days: number;

  @Column('bigint', {
    nullable: true,
  })
  payment_method_id: string | null;

  @Column('text', {
    nullable: true,
  })
  notes: string | null;

  @Column('numeric', {
    nullable: false,
    default: () => '0',
    precision: 20,
    scale: 5,
  })
  total_volume: string;

  @Column('integer', {
    nullable: false,
    default: () => '0',
  })
  total_item: number;

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
    nullable: true,
  })
  updated_time: Date | null;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
  })
  is_deleted: boolean;

  @Column('integer', {
    nullable: false,
    default: () => '0',
  })
  try_attempt: number;

  @Column('numeric', {
    nullable: false,
    default: () => '0',
    precision: 20,
    scale: 5,
  })
  total_cod_item_price: string;

  @Column('character varying', {
    nullable: true,
    length: 255,
  })
  ref_user_id: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
  })
  ref_branch_id: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
  })
  ref_customer_account_id: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
  })
  confirm_number: string | null;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
  })
  is_sync_pod: boolean;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
  })
  is_cod: boolean;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
  })
  is_sync_erp: boolean;

  @Column('character varying', {
    nullable: true,
    length: 255,
  })
  ref_reseller: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
  })
  ref_reseller_phone: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
  })
  ref_awb_number_jne: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
  })
  ref_origin_code: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
  })
  ref_destination_code: string | null;

  @Column('bigint', {
    nullable: true,
  })
  prev_customer_account_id: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
  })
  ref_prev_customer_account_id: string | null;

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

  @Column('boolean', {
    nullable: true,
  })
  is_jne: boolean | null;

  @Column('character varying', {
    nullable: true,
    length: 3,
  })
  ref_representative_code: string | null;
}
