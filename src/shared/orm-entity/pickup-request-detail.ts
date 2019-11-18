import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';

@Entity('pickup_request_detail', { schema: 'public' })
@Index('pickup_request_detail_pickup_request_id_idx', [
  'is_deleted',
  'pickup_request_id',
])
@Index('pickup_request_detail_is_deleted_idx', ['is_deleted'])
@Index('pickup_request_detail_work_order_id_last_idx', ['work_order_id_last'])
export class PickupRequestDetail extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  pickup_request_detail_id: string;

  @Column('bigint', {
    nullable: true,

  })
  pickup_request_id: string | null;

  @Column('bigint', {
    nullable: true,

  })
  awb_item_id: string | null;

  @Column('character varying', {
    nullable: true,
    length: 100,

  })
  ref_awb_number: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  cust_package_id: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  delivery_type: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  destination_code: string | null;

  @Column('text', {
    nullable: true,

  })
  notes: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  origin_code: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  parcel_category: string | null;

  @Column('text', {
    nullable: true,

  })
  parcel_content: string | null;

  @Column('integer', {
    nullable: true,

  })
  parcel_height: number | null;

  @Column('integer', {
    nullable: true,

  })
  parcel_length: number | null;

  @Column('integer', {
    nullable: true,

  })
  parcel_width: number | null;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 2,

  })
  parcel_qty: string | null;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 2,

  })
  parcel_disc_value: string | null;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 2,

  })
  parcel_value: string | null;

  @Column('character varying', {
    nullable: true,
    length: 20,

  })
  parcel_uom: string | null;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 2,

  })
  cod_value: string | null;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 2,

  })
  est_shipping_fee: string | null;

  @Column('text', {
    nullable: true,

  })
  recipient_address: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  recipient_city: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  recipient_district: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  recipient_name: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  recipient_phone: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  recipient_province: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  recipient_title: string | null;

  @Column('character varying', {
    nullable: true,
    length: 20,

  })
  recipient_zip: string | null;

  @Column('text', {
    nullable: true,

  })
  shipper_address: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  shipper_city: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  shipper_district: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  shipper_name: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  shipper_phone: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  shipper_province: string | null;

  @Column('character varying', {
    nullable: true,
    length: 20,

  })
  shipper_zip: string | null;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 2,

  })
  total_weight: string | null;

  @Column('bigint', {
    nullable: true,

  })
  work_order_id_last: string | null;

  @Column('bigint', {
    nullable: false,

  })
  user_id_created: string;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  user_created: string | null;

  @Column('timestamp without time zone', {
    nullable: false,

  })
  created_time: Date;

  @Column('bigint', {
    nullable: false,

  })
  user_id_updated: string;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  user_updated: string | null;

  @Column('timestamp without time zone', {
    nullable: false,

  })
  updated_time: Date;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',

  })
  is_deleted: boolean;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',

  })
  is_return: boolean;

  @Column('character varying', {
    nullable: true,
    length: 100,

  })
  recipient_longitude: string | null;

  @Column('character varying', {
    nullable: true,
    length: 100,

  })
  recipient_latitude: string | null;
}
