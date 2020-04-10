import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { TmsBaseEntity } from './tms-base';
import { PickupRequest } from './pickup-request';
import { AwbItemAttr } from './awb-item-attr';
import { AwbItem } from './awb-item';

@Entity('pickup_request_detail', { schema: 'public' })
// @Index('pickup_request_detail_pickup_request_id_idx', [
//   'is_deleted',
//   'pickup_request_id',
// ])
// @Index('pickup_request_detail_is_deleted_idx', ['is_deleted'])
// @Index('pickup_request_detail_work_order_id_last_idx', ['work_order_id_last'])
export class PickupRequestDetail extends TmsBaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'pickup_request_detail_id',
  })
  pickupRequestDetailId: number;

  @Column('bigint', {
    nullable: true,
    name: 'pickup_request_id',
  })
  pickupRequestId: string | null;

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
  })
  notes: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'origin_code',
  })
  origin_code: string | null;

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
  parcelValue: number | null;

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
  workOrderIdLast: number | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'user_created',
  })
  userCreated: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'user_updated',
  })
  userUpdated: string | null;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_return',
  })
  isReturn: boolean;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_doreturn_sync',
  })
  isDoreturnSync: boolean;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'do_return',
  })
  doReturn: boolean;

  @Column('character varying', {
    nullable: true,
    length: 100,
    name: 'recipient_longitude',
  })
  recipientLongitude: string | null;

  @Column('character varying', {
    nullable: true,
    length: 100,
    name: 'recipient_latitude',
  })
  recipientLatitude: string | null;

  @Column('character varying', {
    nullable: true,
    length: 100,
    name: 'shipper_latitude',
  })
  shipperLatitude: string | null;

  @Column('character varying', {
    nullable: true,
    length: 100,
    name: 'shipper_longitude',
  })
  shipperLongitude: string | null;

  @Column('character varying', {
    nullable: true,
    length: 100,
    name: 'do_return_number',
  })
  doReturnNumber: string | null;

  @Column('numeric', {
    nullable: true,
    precision: 18,
    scale: 2,
    name: 'tax_value',
  })
  taxValue: string | null;

  // @Column('boolean', {
  //   nullable: false,
  //   default: () => 'false',
  //   name: 'do_return',
  // })
  // doReturn: boolean;

  // @Column('character varying', {
  //   nullable: true,
  //   length: 100,
  //   name: 'do_return_number',
  // })
  // doReturnNumber: string | null;

  @Column('character varying', {
    nullable: true,
    length: 100,
    name: 'drop_partner_type',
  })
  dropPartnerType: string | null;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 2,
    name: 'drop_partner_charge',
  })
  dropPartnerCharge: number | null;
}
