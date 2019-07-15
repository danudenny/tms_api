import { BaseEntity, Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('awb_price', { schema: 'public' })
@Index('awb_price_awb_date_idx', ['awbDate'])
@Index('awb_price_awb_number_idx', ['awbNumber'])
@Index('awb_price_customer_account_id_idx', ['customerAccountId'])
@Index('awb_price_from_to_id_idx', ['fromId', 'toId'])
@Index('awb_price_updated_time_idx', ['updatedTime'])
export class AwbPrice extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'awb_price_id',
  })
  awbPriceId: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'awb_number',
  })
  awbNumber: string;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'awb_date',
  })
  awbDate: Date | null;

  @Column('bigint', {
    nullable: true,
    name: 'customer_account_id',
  })
  customerAccountId: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'package_type_id',
  })
  packageTypeId: string | null;

  @Column('integer', {
    nullable: true,
    name: 'from_type',
  })
  fromType: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'from_id',
  })
  fromId: string | null;

  @Column('integer', {
    nullable: true,
    name: 'to_type',
  })
  toType: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'to_id',
  })
  toId: string | null;

  @Column('numeric', {
    nullable: true,
    default: () => '0',
    precision: 20,
    scale: 5,
    name: 'disc_percent',
  })
  discPercent: string | null;

  @Column('numeric', {
    nullable: true,
    default: () => '0',
    precision: 20,
    scale: 5,
    name: 'disc_value',
  })
  discValue: string | null;

  @Column('numeric', {
    nullable: true,
    default: () => '0',
    precision: 20,
    scale: 5,
    name: 'fix_price_disc',
  })
  fixPriceDisc: string | null;

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
    name: 'final_amount',
  })
  finalAmount: string | null;

  @Column('numeric', {
    nullable: false,
    default: () => '0',
    precision: 20,
    scale: 5,
    name: 'total_weight_real',
  })
  totalWeightReal: string;

  @Column('numeric', {
    nullable: false,
    default: () => '0',
    precision: 20,
    scale: 5,
    name: 'total_weight_final_rounded',
  })
  totalWeightFinalRounded: string;

  @Column('numeric', {
    nullable: false,
    default: () => '0',
    precision: 20,
    scale: 5,
    name: 'grand_total_sell_price',
  })
  grandTotalSellPrice: string;

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
    name: 'insurance_admin',
  })
  insuranceAdmin: string;

  @Column('numeric', {
    nullable: false,
    default: () => '0',
    precision: 20,
    scale: 5,
    name: 'total_insurance',
  })
  totalInsurance: string;

  @Column('numeric', {
    nullable: false,
    default: () => '0',
    precision: 20,
    scale: 5,
    name: 'cod_value',
  })
  codValue: string;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'ref_table',
  })
  refTable: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'ref_id',
  })
  refId: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'branch_id',
  })
  branchId: string | null;

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

  @Column('character varying', {
    nullable: true,
    length: 500,
    name: 'consignee_title',
  })
  consigneeTitle: string | null;

  @Column('character varying', {
    nullable: true,
    length: 500,
    name: 'consignee_name',
  })
  consigneeName: string | null;

  @Column('text', {
    nullable: true,
    name: 'consignee_address',
  })
  consigneeAddress: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'consignee_phone',
  })
  consigneePhone: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'consignee_zip',
  })
  consigneeZip: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'consignee_district',
  })
  consigneeDistrict: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'district_id_consignee',
  })
  districtIdConsignee: string | null;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'calculate_date',
  })
  calculateDate: Date | null;

  @Column('bigint', {
    nullable: false,
    name: 'awb_booking_id',
  })
  awbBookingId: string;

  @Column('bigint', {
    nullable: true,
    name: 'invoice_id',
  })
  invoiceId: string | null;

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

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'ref_awb_number_jne',
  })
  refAwbNumberJne: string | null;

  @Column('boolean', {
    nullable: true,
    default: () => 'false',
    name: 'is_jne',
  })
  isJne: boolean | null;

  @Column('character varying', {
    nullable: true,
    length: 3,
    name: 'ref_representative_code',
  })
  refRepresentativeCode: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'pickup_merchant',
  })
  pickupMerchant: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'email_merchant',
  })
  emailMerchant: string | null;
}
