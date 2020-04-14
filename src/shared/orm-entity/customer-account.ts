import { BaseEntity, Column, Entity, Index, OneToMany, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';

import { PackagePriceSpecial } from './package-price-special';
import { CustomerAddress } from './customer-address';
import { Customer } from './customer';
import { DoReturnAwb } from './do_return_awb';

@Entity('customer_account', { schema: 'public' })
@Index('code_rds_idx', ['codeRds'])
@Index(
  'customer_account_customer_account_code_key',
  ['customerAccountCode'],
  { unique: true },
)
@Index('customer_account_is_email_at_night_idx', ['isEmailAtNight'])
export class CustomerAccount extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'customer_account_id',
  })
  customerAccountId: string;

  @Column('bigint', {
    nullable: false,
    name: 'customer_id',
  })
  customerId: string;

  @Column('bigint', {
    nullable: false,
    name: 'customer_category_id',
  })
  customerCategoryId: string;

  @Column('bigint', {
    nullable: false,
    name: 'customer_grade_id',
  })
  customerGradeId: string;

  @Column('character varying', {
    nullable: false,
    unique: true,
    length: 255,
    name: 'customer_account_code',
  })
  customerAccountCode: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'customer_account_name',
  })
  customerAccountName: string;

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
    name: 'npwp_number',
  })
  npwpNumber: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'pic_customer',
  })
  picCustomer: string | null;

  @Column('text', {
    nullable: true,
  })
  note: string | null;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'join_date',
  })
  joinDate: Date;

  @Column('integer', {
    nullable: false,
    name: 'term_of_payment_day',
  })
  termOfPaymentDay: number;

  @Column('character varying', {
    nullable: true,
    length: 20,
    name: 'term_of_payment_based_on',
  })
  termOfPaymentBasedOn: string | null;

  @Column('character varying', {
    nullable: true,
    length: 20,
    name: 'pickup_time_method',
  })
  pickupTimeMethod: string | null;

  @Column('numeric', {
    nullable: true,
    precision: 10,
    scale: 5,
    name: 'disc_percent',
  })
  discPercent: string | null;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 5,
    name: 'disc_value',
  })
  discValue: string | null;

  @Column('integer', {
    nullable: false,
    default: () => '1',
    name: 'status_customer_account',
  })
  statusCustomerAccount: number;

  @Column('numeric', {
    nullable: true,
    default: () => '0',
    precision: 10,
    scale: 5,
    name: 'weight_rounding_const',
  })
  weightRoundingConst: string | null;

  @Column('numeric', {
    nullable: true,
    default: () => '0',
    precision: 10,
    scale: 5,
    name: 'weight_rounding_up_global',
  })
  weightRoundingUpGlobal: string | null;

  @Column('numeric', {
    nullable: true,
    default: () => '0',
    precision: 10,
    scale: 5,
    name: 'weight_rounding_up_detail',
  })
  weightRoundingUpDetail: string | null;

  @Column('numeric', {
    nullable: true,
    default: () => '0',
    precision: 10,
    scale: 5,
    name: 'pickup_lead_time_min_days',
  })
  pickupLeadTimeMinDays: string | null;

  @Column('numeric', {
    nullable: true,
    default: () => '0',
    precision: 10,
    scale: 5,
    name: 'pickup_lead_time_max_days',
  })
  pickupLeadTimeMaxDays: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'employee_id_sales',
  })
  employeeIdSales: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'employee_id_cro',
  })
  employeeIdCro: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'employee_id_finance',
  })
  employeeIdFinance: string | null;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_sms',
  })
  isSms: boolean;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_email_at_night',
  })
  isEmailAtNight: boolean;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_confirmation_volume',
  })
  isConfirmationVolume: boolean;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_resi_back',
  })
  isResiBack: boolean;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_do_back',
  })
  isDoBack: boolean;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_photo_recipient',
  })
  isPhotoRecipient: boolean;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_photo_ktp',
  })
  isPhotoKtp: boolean;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_sharia',
  })
  isSharia: boolean;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_self_billing',
  })
  isSelfBilling: boolean;

  @Column('bigint', {
    nullable: false,
    default: () => '0',
    name: 'customer_account_id_billing',
  })
  customerAccountIdBilling: string;

  @Column('integer', {
    nullable: false,
    default: () => '0',
    name: 'billing_reminder',
  })
  billingReminder: number;

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

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'weight_rounding_up_global_bool',
  })
  weightRoundingUpGlobalBool: boolean;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'weight_rounding_up_detail_bool',
  })
  weightRoundingUpDetailBool: boolean;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_force_weight_rounding',
  })
  isForceWeightRounding: boolean;

  @Column('jsonb', {
    nullable: true,
    name: 'code_rds',
  })
  codeRds: Object | null;

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
    name: 'npwp_attachment_id',
  })
  npwpAttachmentId: string | null;

  @Column('numeric', {
    nullable: true,
    precision: 10,
    scale: 5,
    name: 'disc_jne_percent',
  })
  discJnePercent: string | null;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_email_lph',
  })
  isEmailLph: boolean;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_input_order_id',
  })
  isInputOrderId: boolean;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_load_data_from_internet',
  })
  isLoadDataFromInternet: boolean;

  @Column('boolean', {
    nullable: true,
    name: 'is_promo_3kg',
  })
  isPromo_3kg: boolean | null;

  @OneToMany(
    type => PackagePriceSpecial,
    package_price_special => package_price_special.customerAccount,
  )
  packagePriceSpecials: PackagePriceSpecial[];

  @OneToOne(() => CustomerAddress)
  @JoinColumn({ name: 'customer_account_id', referencedColumnName: 'customerAccountId' })
  customerAddress: CustomerAddress;

  @OneToOne(() => Customer)
  @JoinColumn({ name: 'customer_account_id', referencedColumnName: 'customerId' })
  customer: Customer;
}
