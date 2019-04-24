import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('pickup_request_upload_detail', { schema: 'public' })
export class PickupRequestUploadDetail extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'pickup_request_upload_detail_id',
  })
  pickupRequestUploadDetailId: string;

  @Column('bigint', {
    nullable: true,
    name: 'pickup_request_upload_id',
  })
  pickupRequestUploadId: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'awb_item_id',
  })
  awbItemId: string | null;

  @Column('character varying', {
    nullable: true,
    length: 100,
    name: 'ref_awb_number',
  })
  refAwbNumber: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'cust_package_id',
  })
  custPackageId: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'delivery_type',
  })
  deliveryType: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'destination_code',
  })
  destinationCode: string | null;

  @Column('text', {
    nullable: true,
    name: 'notes',
  })
  notes: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'origin_code',
  })
  originCode: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'parcel_category',
  })
  parcelCategory: string | null;

  @Column('text', {
    nullable: true,
    name: 'parcel_content',
  })
  parcelContent: string | null;

  @Column('integer', {
    nullable: true,
    name: 'parcel_height',
  })
  parcelHeight: number | null;

  @Column('integer', {
    nullable: true,
    name: 'parcel_length',
  })
  parcelLength: number | null;

  @Column('integer', {
    nullable: true,
    name: 'parcel_width',
  })
  parcelWidth: number | null;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 2,
    name: 'parcel_qty',
  })
  parcelQty: string | null;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 2,
    name: 'parcel_disc_value',
  })
  parcelDiscValue: string | null;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 2,
    name: 'parcel_value',
  })
  parcelValue: string | null;

  @Column('character varying', {
    nullable: true,
    length: 20,
    name: 'parcel_uom',
  })
  parcelUom: string | null;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 2,
    name: 'cod_value',
  })
  codValue: string | null;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 2,
    name: 'est_shipping_fee',
  })
  estShippingFee: string | null;

  @Column('text', {
    nullable: true,
    name: 'recipient_address',
  })
  recipientAddress: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'recipient_city',
  })
  recipientCity: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'recipient_district',
  })
  recipientDistrict: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'recipient_name',
  })
  recipientName: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'recipient_phone',
  })
  recipientPhone: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'recipient_province',
  })
  recipientProvince: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'recipient_title',
  })
  recipientTitle: string | null;

  @Column('character varying', {
    nullable: true,
    length: 20,
    name: 'recipient_zip',
  })
  recipientZip: string | null;

  @Column('text', {
    nullable: true,
    name: 'shipper_address',
  })
  shipperAddress: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'shipper_city',
  })
  shipperCity: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'shipper_district',
  })
  shipperDistrict: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'shipper_name',
  })
  shipperName: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'shipper_phone',
  })
  shipperPhone: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'shipper_province',
  })
  shipperProvince: string | null;

  @Column('character varying', {
    nullable: true,
    length: 20,
    name: 'shipper_zip',
  })
  shipperZip: string | null;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 2,
    name: 'total_weight',
  })
  totalWeight: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'work_order_id_last',
  })
  workOrderIdLast: string | null;

  @Column('bigint', {
    nullable: false,
    name: 'user_id_created',
  })
  userIdCreated: string;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'user_created',
  })
  userCreated: string | null;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'created_time',
  })
  createdTime: Date;

  @Column('bigint', {
    nullable: false,
    name: 'user_id_updated',
  })
  userIdUpdated: string;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'user_updated',
  })
  userUpdated: string | null;

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
}
