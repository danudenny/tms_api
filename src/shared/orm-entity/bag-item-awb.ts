import { BaseEntity, Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('bag_item_awb', { schema: 'public' })
@Index('bag_item_awb_awb_item_idx', ['awb_item_id'])
@Index('bag_item_awb_awb_number_idx', ['awb_number'])
@Index('bag_item_awb_bag_item_id_idx', ['bag_item_id'])
@Index('bag_item_awb_is_deleted_idx', ['is_deleted'])
export class BagItemAwb extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  bag_item_awb_id: string;

  @Column('bigint', {
    nullable: false,

  })
  bag_item_id: string;

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
    nullable: false,

  })
  updated_time: Date;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',

  })
  is_deleted: boolean;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  awb_number: string | null;

  @Column('numeric', {
    nullable: false,
    default: () => '0',
    precision: 10,
    scale: 5,

  })
  weight: string;

  @Column('bigint', {
    nullable: true,

  })
  awb_item_id: string | null;

  @Column('integer', {
    nullable: true,

  })
  send_tracking_note: number | null;

  @Column('integer', {
    nullable: true,

  })
  send_tracking_note_out: number | null;
}
