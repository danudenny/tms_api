import { BaseEntity, Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('bag_item_awb', { schema: 'public' })
@Index('bag_item_awb_awb_item_idx', ['awbItemId'])
@Index('bag_item_awb_awb_number_idx', ['awbNumber'])
@Index('bag_item_awb_bag_item_id_idx', ['bagItemId'])
@Index('bag_item_awb_is_deleted_idx', ['isDeleted'])
export class BagItemAwb extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'bag_item_awb_id',
  })
  bagItemAwbId: string;

  @Column('bigint', {
    nullable: false,
    name: 'bag_item_id',
  })
  bagItemId: string;

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
    name: 'awb_number',
  })
  awbNumber: string | null;

  @Column('numeric', {
    nullable: false,
    default: () => '0',
    precision: 10,
    scale: 5,
    name: 'weight',
  })
  weight: string;

  @Column('bigint', {
    nullable: true,
    name: 'awb_item_id',
  })
  awbItemId: string | null;

  @Column('integer', {
    nullable: true,
    name: 'send_tracking_note',
  })
  sendTrackingNote: number | null;

  @Column('integer', {
    nullable: true,
    name: 'send_tracking_note_out',
  })
  sendTrackingNoteOut: number | null;
}
