import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DoPodDeliverDetail } from './do-pod-deliver-detail';

@Entity('do_pod_deliver_history', { schema: 'public' })
export class DoPodDeliverHistory extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'do_pod_deliver_history_id',
  })
  doPodDeliverHistoryId: number;

  @Column('bigint', {
    name: 'do_pod_deliver_detail_id',
  })
  doPodDeliverDetailId: number;

  @Column('bigint', {
    nullable: false,
    name: 'awb_status_id',
  })
  awbStatusId: number;

  @Column('bigint', {
    nullable: false,
    name: 'reason_id',
  })
  reasonId: number;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'awb_status_date_time',
  })
  awbStatusDateTime: Date;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'sync_date_time',
  })
  syncDateTime: Date;

  @Column('character varying', {
    nullable: true,
    length: 100,
    name: 'longitude_delivery',
  })
  longitudeDelivery: string | null;

  @Column('character varying', {
    nullable: true,
    length: 100,
    name: 'latitude_delivery',
  })
  latitudeDelivery: string | null;

  @Column('text', {
    nullable: true,
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

  @ManyToOne(() => DoPodDeliverDetail)
  @JoinColumn({ name: 'do_pod_deliver_detail_id' })
  do_pod_deliver_detail_id: DoPodDeliverDetail;
}
