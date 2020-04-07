import { Column, Entity, PrimaryGeneratedColumn, OneToMany, JoinColumn, OneToOne, ManyToOne } from 'typeorm';

import { TmsBaseEntity } from './tms-base';

@Entity('do_pod_attr', { schema: 'public' })
export class DoPodAttr extends TmsBaseEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'do_pod_attr_id',
  })
  doPodAttrId: string;

  @Column('uuid', {
    nullable: false,
    name: 'do_pod_deliver_id',
  })
  doPodDeliverId: string;

  @Column('bigint', {
    nullable: false,
    name: 'partner_id',
  })
  partnerId: number;

  @Column('character varying', {
    nullable: true,
    name: 'ref_booking_type',
  })
  refBookingType: string;

  @Column('character varying', {
    nullable: true,
    name: 'ref_order_no',
  })
  refOrderNo: string;

  @Column('character varying', {
    nullable: true,
    name: 'ref_status',
  })
  refStatus: string;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'ref_order_created_time',
  })
  refOrderCreatedTime: Date;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'ref_order_dispatch_time',
  })
  refOrderDispatchTime: Date;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'ref_order_arrival_time',
  })
  refOrderArrivalTime: Date;

  @Column('character varying', {
    nullable: true,
    name: 'ref_cancelled_by',
  })
  refCancelledBy: string;

  @Column('character varying', {
    nullable: true,
    name: 'ref_cancel_description',
  })
  refCancelDescription: string;

  @Column('character varying', {
    nullable: true,
    name: 'ref_cancellation_reason',
  })
  refCancellationReason: string;

  @Column('character varying', {
    nullable: true,
    name: 'ref_type',
  })
  refType: string;

  @Column('int', {
    nullable: true,
    name: 'ref_driver_id',
  })
  refDriverId: string;

  @Column('character varying', {
    nullable: true,
    name: 'ref_driver_name',
  })
  refDriverName: string;

  @Column('character varying', {
    nullable: true,
    name: 'ref_driver_phone',
  })
  refDriverPhone: string;

  @Column('character varying', {
    nullable: true,
    name: 'ref_driver_phone2',
  })
  refDriverPhone2: string;

  @Column('character varying', {
    nullable: true,
    name: 'ref_driver_phone3',
  })
  refDriverPhone3: string;

  @Column('character varying', {
    nullable: true,
    name: 'ref_driver_photo_url',
  })
  refDriverPhotoUrl: string;

  @Column('character varying', {
    nullable: true,
    name: 'ref_vehicle_number',
  })
  refVehicleNumber: string;

  @Column('character varying', {
    nullable: true,
    name: 'ref_receiver_name',
  })
  refReceiverName: string;

  @Column('character varying', {
    nullable: true,
    name: 'ref_destination_type',
  })
  refDestinationType: string;

  @Column('bigint', {
    nullable: true,
    name: 'ref_total_distance_in_kms',
  })
  refTotalDistanceInKms: number;

  @Column('character varying', {
    nullable: true,
    name: 'ref_pickup_eta',
  })
  refPickupEta: string;

  @Column('character varying', {
    nullable: true,
    name: 'ref_delivery_eta',
  })
  refDeliveryEta: string;

  @Column('character varying', {
    nullable: true,
    name: 'ref_live_tracking_url',
  })
  refLiveTrackingUrl: string;

  @Column('bigint', {
    nullable: true,
    name: 'branch_id',
  })
  branchId: number;
}
