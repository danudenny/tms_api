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
  })
  weightRounded: number;

  @Column('numeric', {
    nullable: false,
    default: () => 0,
    precision: 20,
    scale: 5,
    name: 'parcel_value',
  })
  parcelValue: number;

  @Column('numeric', {
    nullable: false,
    default: () => 0,
    precision: 20,
    scale: 5,
    name: 'cod_value',
  })
  codValue: number;

  @Column('numeric', {
    nullable: false,
    default: () => 0,
    precision: 20,
    scale: 5,
    name: 'cod_fee',
  })
  codFee: number;

  @Column('character varying', {
    nullable: false,
    length: 50,
    name: 'consignee_name',
  })
  consigneeName: string;

  @Column('bigint', {
    nullable: false,
    name: 'branch_id',
  })
  branchId: number;

  @Column('bigint', {
    nullable: false,
    name: 'partner_id',
  })
  partnerId: number;

  @Column('bigint', {
    nullable: false,
    name: 'user_id_driver',
  })
  userIdDriver: number;

  @Column('bigint', {
    nullable: false,
    name: 'transaction_status_id',
  })
  transactionStatusId: number;

  @Column('bigint', {
    nullable: false,
    name: 'supplier_invoice_status_id',
  })
  supplierInvoiceStatusId: number;

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

  @ManyToOne(() => Partner)
  @JoinColumn({ name: 'partner_id' })
  partner: Partner;
}
