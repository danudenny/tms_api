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

@Entity('awb', { schema: 'public' })
@Index('awb_booking_idx', ['awbBookingId'])
@Index('awb_awb_date_idx', ['awbDate'])
@Index('awb_awb_list_idx', ['awbDate', 'isDeleted'])
@Index('awb_awb_number_idx', ['awbNumber'])
@Index('awb_awb_status_id_last_idx', ['awbStatusIdLast'])
@Index('awb_branch_id_last_idx', ['branchIdLast'])
@Index('awb_customer_account_id_idx', ['customerAccountId'])
@Index('awb_from_id_idx', ['fromId'])
@Index('awb_from_type_idx', ['fromType'])
@Index('awb_is_deleted_idx', ['isDeleted'])
@Index('awb_package_type_id_idx', ['packageTypeId'])
@Index('awb_to_id_idx', ['toId'])
@Index('awb_to_type_idx', ['toType'])
@Index('awb_updated_time_idx', ['updatedTime'])
export class Awb extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'awb_id',
  })
  awbId: string;

  @Column('integer', {
    nullable: false,
    default: () => '1',
    name: 'awb_version',
  })
  awbVersion: number;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'awb_code',
  })
  awbCode: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'awb_number',
  })
  awbNumber: string;

  @Column('bigint', {
    nullable: false,
    name: 'awb_booking_id',
  })
  awbBookingId: string;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'reference_code',
  })
  referenceCode: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'ref_awb_number',
  })
  refAwbNumber: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'ref_transaction_number',
  })
  refTransactionNumber: string | null;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'awb_date',
  })
  awbDate: Date | null;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'awb_date_real',
  })
  awbDateReal: Date | null;

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

  @Column('bigint', {
    nullable: true,
    name: 'user_id',
  })
  userId: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'branch_id',
  })
  branchId: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'customer_account_id',
  })
  customerAccountId: string | null;

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

  @Column('bigint', {
    nullable: true,
    name: 'reseller_id',
  })
  resellerId: string | null;

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
    nullable: false,
    default: () => '0',
    precision: 10,
    scale: 5,
    name: 'lead_time_min_days',
  })
  leadTimeMinDays: string;

  @Column('numeric', {
    nullable: false,
    default: () => '0',
    precision: 10,
    scale: 5,
    name: 'lead_time_max_days',
  })
  leadTimeMaxDays: string;

  @Column('numeric', {
    nullable: false,
    default: () => '0',
    precision: 20,
    scale: 5,
    name: 'total_weight',
  })
  totalWeight: string;

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
    name: 'total_weight_real_rounded',
  })
  totalWeightRealRounded: string;

  @Column('numeric', {
    nullable: false,
    default: () => '0',
    precision: 20,
    scale: 5,
    name: 'total_weight_rounded',
  })
  totalWeightRounded: string;

  @Column('numeric', {
    nullable: false,
    default: () => '0',
    precision: 20,
    scale: 5,
    name: 'total_weight_volume',
  })
  totalWeightVolume: string;

  @Column('numeric', {
    nullable: false,
    default: () => '0',
    precision: 20,
    scale: 5,
    name: 'total_weight_volume_rounded',
  })
  totalWeightVolumeRounded: string;

  @Column('numeric', {
    nullable: false,
    default: () => '0',
    precision: 20,
    scale: 5,
    name: 'total_weight_final',
  })
  totalWeightFinal: string;

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
    name: 'base_price',
  })
  basePrice: string;

  @Column('numeric', {
    nullable: false,
    default: () => '0',
    precision: 20,
    scale: 5,
    name: 'disc_percent',
  })
  discPercent: string;

  @Column('numeric', {
    nullable: false,
    default: () => '0',
    precision: 20,
    scale: 5,
    name: 'disc_value',
  })
  discValue: string;

  @Column('numeric', {
    nullable: false,
    default: () => '0',
    precision: 20,
    scale: 5,
    name: 'sell_price',
  })
  sellPrice: string;

  @Column('numeric', {
    nullable: false,
    default: () => '0',
    precision: 20,
    scale: 5,
    name: 'total_base_price',
  })
  totalBasePrice: string;

  @Column('numeric', {
    nullable: false,
    default: () => '0',
    precision: 20,
    scale: 5,
    name: 'total_disc_percent',
  })
  totalDiscPercent: string;

  @Column('numeric', {
    nullable: false,
    default: () => '0',
    precision: 20,
    scale: 5,
    name: 'total_disc_value',
  })
  totalDiscValue: string;

  @Column('numeric', {
    nullable: false,
    default: () => '0',
    precision: 20,
    scale: 5,
    name: 'total_sell_price',
  })
  totalSellPrice: string;

  @Column('numeric', {
    nullable: false,
    default: () => '0',
    precision: 20,
    scale: 5,
    name: 'total_item_price',
  })
  totalItemPrice: string;

  @Column('numeric', {
    nullable: false,
    default: () => '0',
    precision: 20,
    scale: 5,
    name: 'insurance',
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
    name: 'total_cod_value',
  })
  totalCodValue: string;

  @Column('bigint', {
    nullable: true,
    name: 'awb_history_id_last',
  })
  awbHistoryIdLast: string | null;

  @Column('integer', {
    nullable: true,
    name: 'awb_status_id_last',
  })
  awbStatusIdLast: number | null;

  @Column('integer', {
    nullable: true,
    default: () => '2000',
    name: 'awb_status_id_last_public',
  })
  awbStatusIdLastPublic: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'user_id_last',
  })
  userIdLast: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'branch_id_last',
  })
  branchIdLast: string | null;

  @Column('integer', {
    nullable: false,
    default: () => '0',
    name: 'lead_time_run_days',
  })
  leadTimeRunDays: number;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'history_date_last',
  })
  historyDateLast: Date | null;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'final_status_date',
  })
  finalStatusDate: Date | null;

  @Column('integer', {
    nullable: true,
    name: 'awb_status_id_final',
  })
  awbStatusIdFinal: number | null;

  @Column('integer', {
    nullable: false,
    default: () => '0',
    name: 'lead_time_final_days',
  })
  leadTimeFinalDays: number;

  @Column('bigint', {
    nullable: true,
    name: 'payment_method_id',
  })
  paymentMethodId: string | null;

  @Column('text', {
    nullable: true,
    name: 'notes',
  })
  notes: string | null;

  @Column('numeric', {
    nullable: false,
    default: () => '0',
    precision: 20,
    scale: 5,
    name: 'total_volume',
  })
  totalVolume: string;

  @Column('integer', {
    nullable: false,
    default: () => '0',
    name: 'total_item',
  })
  totalItem: number;

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
    nullable: true,
    name: 'updated_time',
  })
  updatedTime: Date | null;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_deleted',
  })
  isDeleted: boolean;

  @Column('integer', {
    nullable: false,
    default: () => '0',
    name: 'try_attempt',
  })
  tryAttempt: number;

  @Column('numeric', {
    nullable: false,
    default: () => '0',
    precision: 20,
    scale: 5,
    name: 'total_cod_item_price',
  })
  totalCodItemPrice: string;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'ref_user_id',
  })
  refUserId: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'ref_branch_id',
  })
  refBranchId: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'ref_customer_account_id',
  })
  refCustomerAccountId: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'confirm_number',
  })
  confirmNumber: string | null;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_sync_pod',
  })
  isSyncPod: boolean;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_cod',
  })
  isCod: boolean;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_sync_erp',
  })
  isSyncErp: boolean;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'ref_reseller',
  })
  refReseller: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'ref_reseller_phone',
  })
  refResellerPhone: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'ref_awb_number_jne',
  })
  refAwbNumberJne: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'ref_origin_code',
  })
  refOriginCode: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'ref_destination_code',
  })
  refDestinationCode: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'prev_customer_account_id',
  })
  prevCustomerAccountId: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'ref_prev_customer_account_id',
  })
  refPrevCustomerAccountId: string | null;

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

  @Column('boolean', {
    nullable: true,
    name: 'is_jne',
  })
  isJne: boolean | null;

  @Column('character varying', {
    nullable: true,
    length: 3,
    name: 'ref_representative_code',
  })
  refRepresentativeCode: string | null;
}
