import { BaseEntity, Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { AwbItem } from './awb-item';
import { AwbItemAttr } from './awb-item-attr';
import { BagItem } from './bag-item';

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
  bagItemAwbId: number;

  @Column('bigint', {
    nullable: false,
    name: 'bag_item_id',
  })
  bagItemId: number;

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
  awbNumber: string;

  @Column('numeric', {
    nullable: false,
    default: () => '0',
    precision: 10,
    scale: 5,
    name: 'weight',
  })
  weight: number;

  @Column('bigint', {
    nullable: true,
    name: 'awb_item_id',
  })
  awbItemId: number | null;

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

  // relation model
  @ManyToOne(() => BagItem, bagItem => bagItem.bagItemAwbs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'bag_item_id',
  })
  bagItem: BagItem;

  // relation model
  @ManyToOne(() => AwbItem, awbItem => awbItem.awbItemId, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'awb_item_id' })
  awbItem: AwbItem;

  @ManyToOne(() => AwbItemAttr)
  @JoinColumn({ name: 'awb_item_id', referencedColumnName: 'awbItemId' })
  awbItemAttr: AwbItemAttr;
}
