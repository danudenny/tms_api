import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('customer_account_change', { schema: 'public' })
export class CustomerAccountChange extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'customer_account_change_id',
  })
  customerAccountChangeId: string;

  @Column('bigint', {
    nullable: false,
    name: 'customer_account_id',
  })
  customerAccountId: string;

  @Column('bigint', {
    nullable: true,
    name: 'customer_account_change_id_ref',
  })
  customerAccountChangeIdRef: string | null;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'effective_date',
  })
  effectiveDate: Date;

  @Column('integer', {
    nullable: false,
    name: 'term_of_payment_day',
  })
  termOfPaymentDay: number;

  @Column('numeric', {
    nullable: false,
    precision: 10,
    scale: 5,
    name: 'disc_percent',
  })
  discPercent: string;

  @Column('numeric', {
    nullable: false,
    precision: 20,
    scale: 5,
    name: 'disc_value',
  })
  discValue: string;

  @Column('integer', {
    nullable: false,
    default: () => '1',
    name: 'status_customer_account',
  })
  statusCustomerAccount: number;

  @Column('integer', {
    nullable: false,
    default: () => '10',
    name: 'status_customer_account_change',
  })
  statusCustomerAccountChange: number;

  @Column('integer', {
    nullable: false,
    default: () => '0',
    name: 'status_confirm_finance',
  })
  statusConfirmFinance: number;

  @Column('bigint', {
    nullable: true,
    name: 'user_id_confirm_finance',
  })
  userIdConfirmFinance: string | null;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'confirm_time_finance',
  })
  confirmTimeFinance: Date | null;

  @Column('integer', {
    nullable: false,
    default: () => '0',
    name: 'status_confirm_ops',
  })
  statusConfirmOps: number;

  @Column('bigint', {
    nullable: true,
    name: 'user_id_confirm_ops',
  })
  userIdConfirmOps: string | null;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'confirm_time_ops',
  })
  confirmTimeOps: Date | null;

  @Column('integer', {
    nullable: false,
    default: () => '0',
    name: 'status_confirm_sales',
  })
  statusConfirmSales: number;

  @Column('bigint', {
    nullable: true,
    name: 'user_id_confirm_sales',
  })
  userIdConfirmSales: string | null;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'confirm_time_sales',
  })
  confirmTimeSales: Date | null;

  @Column('bigint', {
    nullable: true,
    name: 'employee_id_cro',
  })
  employeeIdCro: string | null;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_cod',
  })
  isCod: boolean;

  @Column('numeric', {
    nullable: true,
    default: () => '0',
    precision: 20,
    scale: 5,
    name: 'fee_per_receipt',
  })
  feePerReceipt: string | null;

  @Column('numeric', {
    nullable: true,
    default: () => '0',
    precision: 10,
    scale: 5,
    name: 'percent_cod_value',
  })
  percentCodValue: string | null;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_land_cargo',
  })
  isLandCargo: boolean;

  @Column('numeric', {
    nullable: true,
    default: () => '0',
    precision: 10,
    scale: 5,
    name: 'percent_land_cargo_discount',
  })
  percentLandCargoDiscount: string | null;

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
    name: 'customer_category_id',
  })
  customerCategoryId: string | null;

  @Column('text', {
    nullable: true,
  })
  note: string | null;

  @Column('numeric', {
    nullable: true,
    precision: 10,
    scale: 5,
    name: 'disc_jne_percent',
  })
  discJnePercent: string | null;
}
