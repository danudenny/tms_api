import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DoPodDeliver } from './do-pod-deliver';

@Entity('do_pod_deliver_detail', { schema: 'public' })
export class DoPodDeliverDetail extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'do_pod_deliver_detail_id',
  })
  doPodDeliverDetailId: number;

  @Column('bigint', {
    name: 'do_pod_deliver_id',
  })
  doPodDeliverId: number;

  @Column('bigint', {
    nullable: false,
    name: 'awb_item_id',
  })
  awbItemId: number;

  @Column('bigint', {
    nullable: false,
    name: 'awb_status_id_last',
  })
  awbStatusIdLast: number;

  @Column('bigint', {
    nullable: false,
    name: 'reason_id_last',
  })
  reasonIdLast: number;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'awb_status_date_time_last',
  })
  awbStatusDateTimeLast: Date;

  @Column('timestamp without time zone', {
    nullable: false,
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
  })
  description_last: string | null;

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
  do_pod_deliver: DoPodDeliver;
}
