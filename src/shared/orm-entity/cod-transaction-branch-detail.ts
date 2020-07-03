import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { TmsBaseEntity } from './tms-base';
import { CodTransactionBranch } from './cod-transaction-branch';
import { Partner } from './partner';

@Entity('cod_transaction_branch_detail', { schema: 'public' })
export class CodTransactionBranchDetail extends TmsBaseEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'cod_transaction_branch_detail_id',
  })
  codTransactionBranchDetailId: string;

  @Column('character varying', {
    nullable: false,
    name: 'cod_transaction_branch_id',
  })
  codTransactionBranchId: string;

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

  //  relation
  @ManyToOne(() => CodTransactionBranch, x => x.details)
  @JoinColumn({
    name: 'cod_transaction_branch_id',
    referencedColumnName: 'codTransactionBranchId',
  })
  transactionBranch: CodTransactionBranch;

  @ManyToOne(() => Partner)
  @JoinColumn({ name: 'partner_id' })
  partner: Partner;
}
