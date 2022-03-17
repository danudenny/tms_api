import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, OneToMany, ManyToOne, PrimaryColumn} from 'typeorm';

import { AwbItem } from './awb-item';
import { BagItem } from './bag-item';
import { Branch } from './branch';
import { AwbStatus } from './awb-status';
import { DoReturnAwb } from './do_return_awb';
import { DoPodDeliverDetail } from './do-pod-deliver-detail';
import { Awb } from './awb';
import { TransactionStatus } from './transaction-status';
import { PickupRequestDetail } from './pickup-request-detail';
import { CodUserToBranch } from './cod-user-to-branch';
import { CodPayment } from './cod-payment';
import { CodTransactionDetail } from './cod-transaction-detail';
import { AwbStatusGrpDetail } from './awb-status-grp-detail';
import { AwbHighValueUpload } from './awb-high-value-upload';

@Entity('awb_item_attr', { schema: 'public' })
export class AwbItemAttr extends BaseEntity {
  @PrimaryColumn({
    type: 'uuid',
    name: 'awb_item_attr_id',
  })
  awbItemAttrId: string;

  @Column('bigint', {
    nullable: false,
    name: 'awb_item_id',
  })
  awbItemId: number;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'awb_number',
  })
  awbNumber: string;

  // @Column('character varying', {
  //   nullable: false,
  //   length: 255,
  //   name: 'awb_number_pl',
  // })
  // awbNumberPl: string;

  @Column('bigint', {
    nullable: true,
    name: 'awb_history_id_last',
  })
  awbHistoryIdLast: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'awb_status_id_last',
  })
  awbStatusIdLast: number | null;

  @Column('bigint', {
    nullable: false,
    name: 'awb_status_id_last_public',
  })
  awbStatusIdLastPublic: number;

  @Column('bigint', {
    nullable: true,
    name: 'user_id_last',
  })
  userIdLast: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'branch_id_last',
  })
  branchIdLast: number | null;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'awb_history_date_last',
  })
  awbHistoryDateLast: Date | null;

  @Column('bigint', {
    nullable: false,
    name: 'lead_time_run_days',
  })
  leadTimeRunDays: number;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'awb_status_final_date',
  })
  awbStatusFinalDate: Date | null;

  @Column('bigint', {
    nullable: false,
    name: 'try_attempt',
  })
  tryAttempt: number;

  @Column('bigint', {
    nullable: true,
    name: 'awb_status_id_final',
  })
  awbStatusIdFinal: number | null;

  @Column('bigint', {
    nullable: false,
    name: 'lead_time_final_days',
  })
  leadTimeFinalDays: number;

  @Column('character varying', {
    nullable: true,
  })
  uuid: string | null;

  @Column('character varying', {
    nullable: true,
    name: 'awb_third_party',
  })
  awbThirdParty: string | null;

  @Column('character varying', {
    nullable: true,
    name: 'doreturn_new_awb',
  })
  doreturnNewAwb: string | null;

  @Column('character varying', {
    nullable: true,
    name: 'doreturn_new_awb_3pl',
  })
  doreturnNewAwb3Pl: string | null;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'created_time',
  })
  createdTime: Date;

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
    name: 'branch_id_next',
  })
  branchIdNext: number | null;

  // relation model
  @OneToOne(() => Branch, branch => branch, {
    eager: false,
    nullable: true,
  })
  @JoinColumn({ name: 'branch_id_last' })
  branchLast: Branch;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_package_combined',
  })
  isPackageCombined: boolean;

  @Column('bigint', {
    nullable: true,
    name: 'bag_item_id_last',
  })
  bagItemIdLast: number;

  // new field
  @Column('bigint', {
    nullable: true,
    name: 'awb_id',
  })
  awbId: number | null;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_sync',
  })
  isSync: boolean;

  @Column('bigint', {
    nullable: false,
    name: 'transaction_status_id',
  })
  transactionStatusId: number;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'internal_process_type',
  })
  internalProcessType: string | null;

  @Column('boolean', {
    nullable: true,
    default: () => 'false',
    name: 'is_high_value',
  })
  isHighValue: boolean;

  // relation
  @OneToOne(() => BagItem)
  @JoinColumn({ name: 'bag_item_id_last' })
  bagItemLast: BagItem;

  @OneToOne(() => DoReturnAwb)
  @JoinColumn({
    name: 'awb_status_id_last',
    referencedColumnName: 'awbStatusIdLast',
  })
  doReturnAwb: DoReturnAwb;

  @OneToOne(() => AwbItem)
  @JoinColumn({ name: 'awb_item_id' })
  awbItem: AwbItem;

  @OneToOne(() => PickupRequestDetail)
  @JoinColumn({ name: 'awb_item_id' })
  pickupRequestDetail: PickupRequestDetail;

  @OneToOne(() => AwbStatus)
  @JoinColumn({ name: 'awb_status_id_last' })
  awbStatus: AwbStatus;

  @OneToOne(() => AwbStatus)
  @JoinColumn({ name: 'awb_status_id_final' })
  awbStatusFinal: AwbStatus;

  @OneToOne(() => Awb)
  @JoinColumn({ name: 'awb_id' })
  awb: Awb;

  @OneToOne(() => DoPodDeliverDetail)
  @JoinColumn({ name: 'awb_item_id', referencedColumnName: 'awbItemId' })
  doPodDeliverDetail: DoPodDeliverDetail;

  @ManyToOne(() => TransactionStatus)
  @JoinColumn({ name: 'transaction_status_id' })
  transactionStatus: TransactionStatus;

  @OneToOne(() => CodUserToBranch)
  @JoinColumn({ name: 'branch_id_last', referencedColumnName: 'branchId' })
  codUserToBranch: CodUserToBranch;

  @OneToOne(() => CodPayment)
  @JoinColumn({ name: 'awb_item_id', referencedColumnName: 'awbItemId' })
  codPayment: CodPayment;

  @OneToOne(() => CodTransactionDetail)
  @JoinColumn({ name: 'awb_item_id', referencedColumnName: 'awbItemId' })
  codTransactionDetail: CodTransactionDetail;

  @OneToOne(() => AwbStatusGrpDetail)
  @JoinColumn({ name: 'awb_status_id_last', referencedColumnName: 'awbStatusId' })
  awbStatusGrpDetail: AwbStatusGrpDetail;

  @OneToOne(() => AwbHighValueUpload)
  @JoinColumn({ name: 'awb_item_id', referencedColumnName: 'awbItemId' })
  awbHighValueUpload: AwbHighValueUpload;
}
