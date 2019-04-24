import { BaseEntity, Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('awb_item', { schema: 'public' })
@Index('awb_item_awb_id_idx', ['awbId', 'isDeleted'])
@Index('awb_item_is_deleted_idx', ['isDeleted'])
export class AwbItem extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'awb_item_id',
  })
  awbItemId: string;

  @Column('bigint', {
    nullable: false,
    name: 'awb_id',
  })
  awbId: string;

  @Column('bigint', {
    nullable: true,
    name: 'bag_item_id_last',
  })
  bagItemIdLast: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'do_awb_id_delivery',
  })
  doAwbIdDelivery: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'do_awb_id_pickup',
  })
  doAwbIdPickup: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'attachment_tms_id',
  })
  attachmentTmsId: string | null;

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
    name: 'width',
  })
  width: string | null;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 5,
    name: 'length',
  })
  length: string | null;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 5,
    name: 'height',
  })
  height: string | null;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 5,
    name: 'volume',
  })
  volume: string | null;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 5,
    name: 'divider_volume',
  })
  dividerVolume: string | null;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 5,
    name: 'weight_volume',
  })
  weightVolume: string | null;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 5,
    name: 'weight_volume_rounded',
  })
  weightVolumeRounded: string | null;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 5,
    name: 'weight',
  })
  weight: string | null;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 5,
    name: 'weight_rounded',
  })
  weightRounded: string | null;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 5,
    name: 'weight_final',
  })
  weightFinal: string | null;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 5,
    name: 'awb_item_price',
  })
  awbItemPrice: string | null;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 5,
    name: 'insurance',
  })
  insurance: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'packing_type_id',
  })
  packingTypeId: string | null;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 5,
    name: 'packing_price',
  })
  packingPrice: string | null;

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
  itemQty: string | null;

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
  userIdLast: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'branch_id_last',
  })
  branchIdLast: string | null;

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
  awbHistoryIdLast: string | null;

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
  weightReal: string | null;

  @Column('numeric', {
    nullable: true,
    default: () => '0',
    precision: 20,
    scale: 5,
    name: 'weight_real_rounded',
  })
  weightRealRounded: string | null;

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

  @Column('numeric', {
    nullable: false,
    default: () => '0',
    precision: 20,
    scale: 5,
    name: 'cod_item_price',
  })
  codItemPrice: string;

  @Column('numeric', {
    nullable: false,
    default: () => '0',
    precision: 20,
    scale: 5,
    name: 'cod_value',
  })
  codValue: string;
}
