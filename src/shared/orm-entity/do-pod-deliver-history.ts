import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { DoPodDeliverDetail } from './do-pod-deliver-detail';
import { TmsBaseEntity } from './tms-base';

@Entity('do_pod_deliver_history', { schema: 'public' })
export class DoPodDeliverHistory extends TmsBaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'do_pod_deliver_history_id',
  })
  doPodDeliverHistoryId: number;

  @Column('bigint', {
    nullable: false,
    name: 'do_pod_deliver_detail_id',
  })
  doPodDeliverDetailId: number;

  @Column('bigint', {
    nullable: false,
    name: 'awb_status_id',
  })
  awbStatusId: number;

  @Column('bigint', {
    nullable: true,
    name: 'reason_id',
  })
  reasonId: number | null;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'awb_status_date_time',
  })
  awbStatusDateTime: Date | null;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'history_date_time',
  })
  historyDateTime: Date | null;

  @Column('bigint', {
    nullable: false,
    name: 'employee_id_driver',
  })
  employeeIdDriver: number;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'sync_date_time',
  })
  syncDateTime: Date | null;

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
  desc: string | null;

  @ManyToOne(() => DoPodDeliverDetail)
  @JoinColumn({ name: 'do_pod_deliver_detail_id' })
  doPodDeliverDetail: DoPodDeliverDetail;
}
