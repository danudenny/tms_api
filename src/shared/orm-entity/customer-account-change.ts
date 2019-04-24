import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('customer_account_change', { schema: 'public' })
export class CustomerAccountChange extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  customer_account_change_id: string;

  @Column('bigint', {
    nullable: false,

  })
  customer_account_id: string;

  @Column('bigint', {
    nullable: true,

  })
  customer_account_change_id_ref: string | null;

  @Column('timestamp without time zone', {
    nullable: false,

  })
  effective_date: Date;

  @Column('integer', {
    nullable: false,

  })
  term_of_payment_day: number;

  @Column('numeric', {
    nullable: false,
    precision: 10,
    scale: 5,

  })
  disc_percent: string;

  @Column('numeric', {
    nullable: false,
    precision: 20,
    scale: 5,

  })
  disc_value: string;

  @Column('integer', {
    nullable: false,
    default: () => '1',

  })
  status_customer_account: number;

  @Column('integer', {
    nullable: false,
    default: () => '10',

  })
  status_customer_account_change: number;

  @Column('integer', {
    nullable: false,
    default: () => '0',

  })
  status_confirm_finance: number;

  @Column('bigint', {
    nullable: true,

  })
  user_id_confirm_finance: string | null;

  @Column('timestamp without time zone', {
    nullable: true,

  })
  confirm_time_finance: Date | null;

  @Column('integer', {
    nullable: false,
    default: () => '0',

  })
  status_confirm_ops: number;

  @Column('bigint', {
    nullable: true,

  })
  user_id_confirm_ops: string | null;

  @Column('timestamp without time zone', {
    nullable: true,

  })
  confirm_time_ops: Date | null;

  @Column('integer', {
    nullable: false,
    default: () => '0',

  })
  status_confirm_sales: number;

  @Column('bigint', {
    nullable: true,

  })
  user_id_confirm_sales: string | null;

  @Column('timestamp without time zone', {
    nullable: true,

  })
  confirm_time_sales: Date | null;

  @Column('bigint', {
    nullable: true,

  })
  employee_id_cro: string | null;

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

  @Column('bigint', {
    nullable: true,

  })
  customer_category_id: string | null;

  @Column('text', {
    nullable: true,

  })
  note: string | null;

  @Column('numeric', {
    nullable: true,
    precision: 10,
    scale: 5,

  })
  disc_jne_percent: string | null;
}
