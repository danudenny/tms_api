import { BaseEntity, Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('awb_item', { schema: 'public' })
@Index('awb_item_awb_id_idx', ['awb_id', 'is_deleted'])
@Index('awb_item_is_deleted_idx', ['is_deleted'])
export class AwbItem extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  awb_item_id: string;

  @Column('bigint', {
    nullable: false,
  })
  awb_id: string;

  @Column('bigint', {
    nullable: true,
  })
  bag_item_id_last: string | null;

  @Column('bigint', {
    nullable: true,
  })
  do_awb_id_delivery: string | null;

  @Column('bigint', {
    nullable: true,
  })
  do_awb_id_pickup: string | null;

  @Column('bigint', {
    nullable: true,
  })
  attachment_tms_id: string | null;

  @Column('integer', {
    nullable: true,
    default: () => '1',
  })
  awb_item_seq: number | null;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 5,
  })
  width: string | null;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 5,
  })
  length: string | null;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 5,
  })
  height: string | null;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 5,
  })
  volume: string | null;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 5,
  })
  divider_volume: string | null;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 5,
  })
  weight_volume: string | null;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 5,
  })
  weight_volume_rounded: string | null;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 5,
  })
  weight: string | null;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 5,
  })
  weight_rounded: string | null;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 5,
  })
  weight_final: string | null;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 5,
  })
  awb_item_price: string | null;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 5,
  })
  insurance: string | null;

  @Column('bigint', {
    nullable: true,
  })
  packing_type_id: string | null;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 5,
  })
  packing_price: string | null;

  @Column('text', {
    nullable: true,
  })
  item_description: string | null;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 5,
  })
  item_qty: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
  })
  item_unit: string | null;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 5,
  })
  item_price: string | null;

  @Column('integer', {
    nullable: true,
  })
  awb_status_id_last: number | null;

  @Column('integer', {
    nullable: false,
    default: () => '2000',
  })
  awb_status_id_last_public: number;

  @Column('bigint', {
    nullable: true,
  })
  user_id_last: string | null;

  @Column('bigint', {
    nullable: true,
  })
  branch_id_last: string | null;

  @Column('timestamp without time zone', {
    nullable: true,
  })
  history_date_last: Date | null;

  @Column('integer', {
    nullable: false,
    default: () => '0',
  })
  try_attempt: number;

  @Column('timestamp without time zone', {
    nullable: true,
  })
  awb_date: Date | null;

  @Column('timestamp without time zone', {
    nullable: true,
  })
  awb_date_real: Date | null;

  @Column('bigint', {
    nullable: true,
  })
  awb_history_id_last: string | null;

  @Column('integer', {
    nullable: false,
    default: () => '0',
  })
  lead_time_run_days: number;

  @Column('timestamp without time zone', {
    nullable: true,
  })
  final_status_date: Date | null;

  @Column('integer', {
    nullable: true,
  })
  awb_status_id_final: number | null;

  @Column('integer', {
    nullable: false,
    default: () => '0',
  })
  lead_time_final_days: number;

  @Column('numeric', {
    nullable: true,
    default: () => '0',
    precision: 20,
    scale: 5,
  })
  weight_real: string | null;

  @Column('numeric', {
    nullable: true,
    default: () => '0',
    precision: 20,
    scale: 5,
  })
  weight_real_rounded: string | null;

  @Column('bigint', {
    nullable: false,
  })
  user_id_created: string;

  @Column('timestamp without time zone', {
    nullable: false,
  })
  created_time: Date;

  @Column('bigint', {
    nullable: false,
  })
  user_id_updated: string;

  @Column('timestamp without time zone', {
    nullable: true,
  })
  updated_time: Date | null;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
  })
  is_deleted: boolean;

  @Column('numeric', {
    nullable: false,
    default: () => '0',
    precision: 20,
    scale: 5,
  })
  cod_item_price: string;

  @Column('numeric', {
    nullable: false,
    default: () => '0',
    precision: 20,
    scale: 5,
  })
  cod_value: string;
}
