import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { AwbItem } from './awb-item';
import { AwbItemAttr } from './awb-item-attr';
import { DoPodDeliver } from './do-pod-deliver';

@Entity('do_pod_deliver_detail', { schema: 'public' })
export class DoPodDeliverDetail extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'do_pod_deliver_detail_id',
  })
  doPodDeliverDetailId: number;

  @Column('bigint', {
    nullable: false,
    name: 'do_pod_deliver_id',
  })
  doPodDeliverId: number;

  @Column('bigint', {
    nullable: true,
    name: 'awb_item_id',
  })
  awbItemId: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'awb_status_id_last',
  })
  awbStatusIdLast: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'reason_id_last',
  })
  reasonIdLast: number | null;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'awb_status_date_time_last',
  })
  awbStatusDateTimeLast: Date;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'sync_date_time_last',
  })
  syncDateTimeLast: Date;

  @Column('character varying', {
    nullable: true,
    length: 100,
    name: 'longitude_delivery_last',
  })
  longitudeDeliveryLast: string | null;

  @Column('character varying', {
    nullable: true,
    length: 100,
    name: 'latitude_delivery_last',
  })
  latitudeDeliveryLast: string | null;

  @Column('text', {
    nullable: true,
    name: 'description',
  })
  description: string | null;

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

  @ManyToOne(() => DoPodDeliver)
  @JoinColumn({ name: 'do_pod_deliver_id' })
  doPodDeliver: DoPodDeliver;

  @OneToOne(() => AwbItem)
  @JoinColumn({ name: 'awb_item_id' })
  awbItem: AwbItem;

  @OneToOne(() => AwbItemAttr)
  @JoinColumn({ name: 'awb_item_id', referencedColumnName: 'awbItemId' })
  awbItemAttr: AwbItemAttr;
}
