import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { TmsBaseEntity } from './tms-base';
import { CodTransaction } from './cod-transaction';
import { Partner } from './partner';
import { TransactionStatus } from './transaction-status';
import { CodSupplierInvoice } from './cod-supplier-invoice';
import { ColumnNumericTransformer } from './column-numeric-transformer';
import { User } from './user';

@Entity('cod_transaction_detail', { schema: 'public' })
export class CodTransactionDetail extends TmsBaseEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'cod_transaction_detail_id',
  })
  codTransactionDetailId: string;

  @Column('uuid', {
    nullable: true,
    name: 'cod_transaction_id',
  })
  codTransactionId: string;

  @Column('uuid', {
    nullable: true,
    name: 'cod_supplier_invoice_id',
  })
  codSupplierInvoiceId: string;

  @Column('bigint', {
    nullable: false,
    name: 'awb_item_id',
    transformer: new ColumnNumericTransformer(),
  })
  awbItemId: number;

  @Column('character varying', {
    nullable: false,
    length: 100,
    name: 'awb_number',
  })
  awbNumber: string;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'awb_date',
  })
  awbDate: Date;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'pod_date',
  })
  podDate: Date;

  @Column('character varying', {
    nullable: false,
    length: 50,
    name: 'payment_method',
  })
  paymentMethod: string;

  @Column('character varying', {
    nullable: true,
    length: 100,
    name: 'payment_service',
  })
  paymentService: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'no_reference',
  })
  noReference: string | null;

  @Column('numeric', {
    nullable: false,
    default: () => 0,
    precision: 20,
    scale: 5,
    name: 'weight_rounded',
    transformer: new ColumnNumericTransformer(),
  })
  weightRounded: number;

  @Column('numeric', {
    nullable: false,
    default: () => 0,
    precision: 20,
    scale: 5,
    name: 'parcel_value',
    transformer: new ColumnNumericTransformer(),
  })
  parcelValue: number;

  @Column('numeric', {
    nullable: false,
    default: () => 0,
    precision: 20,
    scale: 5,
    name: 'cod_value',
    transformer: new ColumnNumericTransformer(),
  })
  codValue: number;

  @Column('numeric', {
    nullable: false,
    default: () => 0,
    precision: 20,
    scale: 5,
    name: 'cod_fee',
    transformer: new ColumnNumericTransformer(),
  })
  codFee: number;

  @Column('bigint', {
    nullable: true,
    name: 'pickup_source_id',
    transformer: new ColumnNumericTransformer(),
  })
  pickupSourceId: number;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'pickup_source',
  })
  pickupSource: string;

  @Column('bigint', {
    nullable: false,
    name: 'current_position_id',
    transformer: new ColumnNumericTransformer(),
  })
  currentPositionId: number;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'current_position',
  })
  currentPosition: string;

  @Column('bigint', {
    nullable: false,
    name: 'destination_id',
    transformer: new ColumnNumericTransformer(),
  })
  destinationId: number;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'destination_code',
  })
  destinationCode: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'destination',
  })
  destination: string;

  @Column('bigint', {
    nullable: false,
    name: 'partner_id',
    transformer: new ColumnNumericTransformer(),
  })
  partnerId: number;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'partner_name',
  })
  partnerName: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'consignee_name',
  })
  consigneeName: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'cust_package',
  })
  custPackage: string;

  @Column('bigint', {
    nullable: false,
    name: 'package_type_id',
    transformer: new ColumnNumericTransformer(),
  })
  packageTypeId: number;

  @Column('character varying', {
    nullable: false,
    length: 100,
    name: 'package_type_code',
  })
  packageTypeCode: string;

  @Column('character varying', {
    nullable: false,
    length: 100,
    name: 'package_type',
  })
  packageType: string;

  @Column('text', {
    nullable: true,
    name: 'parcel_content',
  })
  parcelContent: string | null;

  @Column('text', {
    nullable: true,
    name: 'parcel_note',
  })
  parcelNote: string | null;

  @Column('bigint', {
    nullable: false,
    name: 'branch_id',
    transformer: new ColumnNumericTransformer(),
  })
  branchId: number;

  @Column('bigint', {
    nullable: false,
    name: 'user_id_driver',
    transformer: new ColumnNumericTransformer(),
  })
  userIdDriver: number;

  @Column('bigint', {
    nullable: false,
    name: 'transaction_status_id',
    transformer: new ColumnNumericTransformer(),
  })
  transactionStatusId: number;

  @Column('bigint', {
    nullable: false,
    name: 'supplier_invoice_status_id',
    transformer: new ColumnNumericTransformer(),
  })
  supplierInvoiceStatusId: number;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_void',
  })
  isVoid: boolean;

  @Column('text', {
    nullable: true,
    name: 'void_note',
  })
  voidNote: string | null;

  //  relation
  // @ManyToOne(() => TransactionStatus)
  // @JoinColumn({ name: 'supplier_invoice_status_id' })
  // supplierInvoiceStatus: TransactionStatus;

  @ManyToOne(() => TransactionStatus)
  @JoinColumn({ name: 'transaction_status_id' })
  transactionStatus: TransactionStatus;

  @ManyToOne(() => CodTransaction, x => x.details)
  @JoinColumn({
    name: 'cod_transaction_id',
    referencedColumnName: 'codTransactionId',
  })
  transactionBranch: CodTransaction;

  @ManyToOne(() => CodSupplierInvoice, x => x.details)
  @JoinColumn({
    name: 'cod_supplier_invoice_id',
    referencedColumnName: 'codSupplierInvoiceId',
  })
  transactionAwb: CodSupplierInvoice;

  @ManyToOne(() => Partner)
  @JoinColumn({ name: 'partner_id' })
  partner: Partner;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id_updated' })
  userAdmin: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id_driver' })
  userDriver: User;
}
