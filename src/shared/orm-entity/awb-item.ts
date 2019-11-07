import { BaseEntity, Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, OneToOne } from 'typeorm';

import { Awb } from './awb';
import { AwbItemAttr } from './awb-item-attr';
import { AwbAttr } from './awb-attr';

@Entity('awb_item', { schema: 'public' })
@Index('awb_item_awb_id_idx', ['awbId', 'isDeleted'])
@Index('awb_item_is_deleted_idx', ['isDeleted'])
export class AwbItem extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'awb_item_id',
  })
  awbItemId: number;

  @Column('bigint', {
    nullable: false,
    name: 'awb_id',
  })
  awbId: number;

  @Column('bigint', {
    nullable: true,
    name: 'bag_item_id_last',
  })
  bagItemIdLast: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'do_awb_id_delivery',
  })
  doAwbIdDelivery: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'do_awb_id_pickup',
  })
  doAwbIdPickup: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'attachment_tms_id',
  })
  attachmentTmsId: number | null;

  @Column('integer', {
    nullable: true,
    default: () => '1',
    name: 'awb_item_seq',
  })
  awbItemSeq: number | null;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 5,
  })
  width: number | null;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 5,
  })
  length: number | null;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 5,
  })
  height: number | null;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 5,
  })
  volume: number | null;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 5,
    name: 'divider_volume',
  })
  dividerVolume: number | null;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 5,
    name: 'weight_volume',
  })
  weightVolume: number | null;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 5,
    name: 'weight_volume_rounded',
  })
  weightVolumeRounded: number | null;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 5,
  })
  weight: number | null;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 5,
    name: 'weight_rounded',
  })
  weightRounded: number | null;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 5,
    name: 'weight_final',
  })
  weightFinal: number | null;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 5,
    name: 'awb_item_price',
  })
  awbItemPrice: number | null;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 5,
  })
  insurance: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'packing_type_id',
  })
  packingTypeId: number | null;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 5,
    name: 'packing_price',
  })
  packingPrice: number | null;

  @Column('text', {
    nullable: true,
    name: 'item_description',
  })
  itemDescription: string | null;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 5,
    name: 'item_qty',
  })
  itemQty: number | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'item_unit',
  })
  itemUnit: string | null;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 5,
    name: 'item_price',
  })
  itemPrice: string | null;

  @Column('integer', {
    nullable: true,
    name: 'awb_status_id_last',
  })
  awbStatusIdLast: number | null;

  @Column('integer', {
    nullable: false,
    default: () => '2000',
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
    name: 'history_date_last',
  })
  historyDateLast: Date | null;

  @Column('integer', {
    nullable: false,
    default: () => '0',
    name: 'try_attempt',
  })
  tryAttempt: number;

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

  @Column('bigint', {
    nullable: true,
    name: 'awb_history_id_last',
  })
  awbHistoryIdLast: number | null;

  @Column('integer', {
    nullable: false,
    default: () => '0',
    name: 'lead_time_run_days',
  })
  leadTimeRunDays: number;

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

  @Column('numeric', {
    nullable: true,
    default: () => '0',
    precision: 20,
    scale: 5,
    name: 'weight_real',
  })
  weightReal: number | null;

  @Column('numeric', {
    nullable: true,
    default: () => '0',
    precision: 20,
    scale: 5,
    name: 'weight_real_rounded',
  })
  weightRealRounded: number | null;

  @Column('bigint', {
    nullable: false,
    name: 'user_id_created',
  })
  userIdCreated: number;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'created_time',
  })
  createdTime: Date;

  @Column('bigint', {
    nullable: false,
    name: 'user_id_updated',
  })
  userIdUpdated: number;

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

  @Column('bigint', {
    nullable: false,
    name: 'partner_logistic_awb',
  })
  partnerLogisticAwb: number;

  @Column('bigint', {
    nullable: false,
    name: 'origin_awb_id',
  })
  originAwbId: number;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_return',
  })
  isReturn: boolean;

  @Column('numeric', {
    nullable: false,
    default: () => '0',
    precision: 20,
    scale: 5,
    name: 'cod_item_price',
  })
  codItemPrice: number;

  @Column('numeric', {
    nullable: false,
    default: () => '0',
    precision: 20,
    scale: 5,
    name: 'cod_value',
  })
  codValue: number;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'awb_type',
  })
  awbType: string;

  // new field
  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'awb_number',
  })
  awbNumber: string;

  @ManyToOne(() => Awb, e => e.awbItems)
  @JoinColumn({ name: 'awb_id', referencedColumnName: 'awbId' })
  awb: Awb;

  @OneToOne(() => AwbItemAttr)
  @JoinColumn({ name: 'awb_item_id', referencedColumnName: 'awbItemId' })
  awbItemAttr: AwbItemAttr;

  @OneToOne(() => AwbAttr)
  @JoinColumn({ name: 'awb_id', referencedColumnName: 'awbId' })
  awbAttr: AwbAttr;
}
