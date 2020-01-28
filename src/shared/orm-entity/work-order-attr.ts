import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TmsBaseEntity } from './tms-base';

@Entity('work_order_attr', { schema: 'public' })
export class WorkOrderAttr extends TmsBaseEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'work_order_attr_id',
  })
  workOrderAttrId: string;

  @Column('bigint', {
    nullable: false,
    name: 'work_order_id',
  })
  workOrderId: number;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'ref_order_created_time',
  })
  refOrderCreatedTime: Date;

  @Column('bigint', {
    nullable: false,
    name: 'partner_id',
  })
  partnerId: string;

  @Column('character varying', {
    nullable: false,
    name: 'ref_order_no',
  })
  refOrderNo: string;

  @Column('character varying', {
    nullable: true,
    name: 'ref_booking_type',
  })
  refBookingType: string | null;

  @Column('character varying', {
    nullable: true,
    name: 'ref_status',
  })
  refStatus: string | null;

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
  refCancelledBy: string | null;

  @Column('character varying', {
    nullable: true,
    name: 'ref_cancel_description',
  })
  refCancelDescription: string | null;

  @Column('character varying', {
    nullable: true,
    name: 'ref_cancellation_reason',
  })
  refCancellationReason: string | null;

  @Column('bigint', {
    nullable: false,
    name: 'ref_driver_id',
  })
  refDriverId: number | 0;

  @Column('character varying', {
    nullable: true,
    name: 'ref_driver_name',
  })
  refDriverName: string | null;

  @Column('character varying', {
    nullable: true,
    name: 'ref_driver_phone',
  })
  refDriverPhone: string | null;

  @Column('character varying', {
    nullable: true,
    name: 'ref_driver_phone2',
  })
  refDriverPhone2: string | null;

  @Column('character varying', {
    nullable: true,
    name: 'ref_driver_phone3',
  })
  refDriverPhone3: string | null;

  @Column('character varying', {
    nullable: true,
    name: 'ref_driver_photo_url',
  })
  refDriverPhotoUrl: string | null;

  @Column('character varying', {
    nullable: true,
    name: 'ref_vehicle_number',
  })
  refVehicleNumber: string | null;

  @Column('character varying', {
    nullable: true,
    name: 'ref_receiver_name',
  })
  refReceiverName: string | null;

  @Column('character varying', {
    nullable: true,
    name: 'ref_destination_type',
  })
  refDestinationType: string | null;

  @Column('numeric', {
    nullable: true,
    default: () => '0',
    precision: 20,
    scale: 5,
    name: 'ref_total_distance_in_kms',
  })
  refTotalDistanceInKms: number;

  @Column('character varying', {
    nullable: true,
    name: 'ref_pickup_eta',
  })
  refPickupEta: string | null;

  @Column('character varying', {
    nullable: true,
    name: 'ref_delivery_eta',
  })
  refDeliveryEta: string | null;

  @Column('character varying', {
    nullable: true,
    name: 'ref_live_tracking_url',
  })
  refLiveTrackingUrl: string | null;
}
