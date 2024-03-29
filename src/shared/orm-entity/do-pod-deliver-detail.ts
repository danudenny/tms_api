import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

import { AwbItem } from './awb-item';
import { AwbItemAttr } from './awb-item-attr';
import { DoPodDeliver } from './do-pod-deliver';
import { TmsBaseEntity } from './tms-base';
import { AwbStatus } from './awb-status';
import { Reason } from './reason';
import { Awb } from './awb';
import { DoPodDetail } from './do-pod-detail';
import { PickupRequestDetail } from './pickup-request-detail';
import { CodPayment } from './cod-payment';
import { User } from './user';

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

  @Column('bigint', {
    nullable: true,
    name: 'awb_id',
  })
  awbId: number | null;

  @Column('date', {
    nullable: false,
    name: 'awb_status_date_last',
  })
  awbStatusDateLast: Date;

  @ManyToOne(() => DoPodDeliver)
  @JoinColumn({ name: 'do_pod_deliver_id' })
  doPodDeliver: DoPodDeliver;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id_updated', referencedColumnName: 'userId' })
  userUpdated: User;

  @OneToOne(() => AwbItem)
  @JoinColumn({ name: 'awb_item_id' })
  awbItem: AwbItem;

  @OneToOne(() => Awb)
  @JoinColumn({ name: 'awb_id' })
  awb: Awb;

  @OneToOne(() => AwbItemAttr)
  @JoinColumn({ name: 'awb_item_id', referencedColumnName: 'awbItemId' })
  awbItemAttr: AwbItemAttr;

  @OneToOne(() => AwbStatus)
  @JoinColumn({ name: 'awb_status_id_last' })
  awbStatus: AwbStatus;

  @OneToOne(() => Reason)
  @JoinColumn({ name: 'reason_id_last', referencedColumnName: 'reasonId' })
  reasonLast: Reason;

  @OneToOne(() => DoPodDetail)
  @JoinColumn({ name: 'awb_item_id', referencedColumnName: 'awbItemId' })
  doPodDetails: DoPodDetail;

  @OneToOne(() => DoPodDeliver)
  @JoinColumn({
    name: 'do_pod_deliver_id',
    referencedColumnName: 'doPodDeliverId',
  })
  doPodDeliverReturn: DoPodDeliver;

  @OneToOne(() => PickupRequestDetail)
  @JoinColumn({ name: 'awb_item_id', referencedColumnName: 'awbItemId' })
  pickupRequestDetail: PickupRequestDetail;

  @OneToOne(() => CodPayment)
  @JoinColumn({
    name: 'do_pod_deliver_detail_id',
    referencedColumnName: 'doPodDeliverDetailId',
  })
  codPayment: CodPayment;
}
