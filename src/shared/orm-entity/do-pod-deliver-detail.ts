import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { AwbItem } from './awb-item';
import { AwbItemAttr } from './awb-item-attr';
import { DoPodDeliver } from './do-pod-deliver';
import { TmsBaseEntity } from './tms-base';
import { AwbStatus } from './awb-status';

@Entity('do_pod_deliver_detail', { schema: 'public' })
export class DoPodDeliverDetail extends TmsBaseEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'do_pod_deliver_detail_id',
  })
  doPodDeliverDetailId: string;

  @Column('character varying', {
    nullable: false,
    name: 'do_pod_deliver_id',
  })
  doPodDeliverId: string;

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

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'consignee_name',
  })
  consigneeName: string | null;

  @Column('text', {
    nullable: true,
    name: 'desc_last',
  })
  descLast: string | null;

  // new field
  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'awb_number',
  })
  awbNumber: string;

  @ManyToOne(() => DoPodDeliver)
  @JoinColumn({ name: 'do_pod_deliver_id' })
  doPodDeliver: DoPodDeliver;

  @OneToOne(() => AwbItem)
  @JoinColumn({ name: 'awb_item_id' })
  awbItem: AwbItem;

  @OneToOne(() => AwbItemAttr)
  @JoinColumn({ name: 'awb_item_id', referencedColumnName: 'awbItemId' })
  awbItemAttr: AwbItemAttr;

  @OneToOne(() => AwbStatus)
  @JoinColumn({ name: 'awb_status_id_last' })
  awbStatus: AwbStatus;
}
