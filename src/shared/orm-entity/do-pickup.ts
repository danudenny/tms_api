import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('do_pickup', { schema: 'public' })
export class DoPickup extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'do_pickup_id',
  })
  doPickupId: string;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'do_pickup_date',
  })
  doPickupDate: Date;

  @Column('bigint', {
    nullable: false,
    name: 'user_id',
  })
  userId: string;

  @Column('bigint', {
    nullable: false,
    name: 'branch_id',
  })
  branchId: string;

  @Column('bigint', {
    nullable: false,
    name: 'employee_id',
  })
  employeeId: string;

  @Column('character varying', {
    nullable: true,
    length: 500,
    name: 'work_order_group',
  })
  workOrderGroup: string | null;

  @Column('character varying', {
    nullable: true,
    length: 500,
    name: 'work_order_group_encrypt',
  })
  workOrderGroupEncrypt: string | null;

  @Column('character varying', {
    nullable: true,
    length: 100,
    name: 'latitude_check_in',
  })
  latitudeCheckIn: string | null;

  @Column('character varying', {
    nullable: true,
    length: 100,
    name: 'latitude_check_out',
  })
  latitudeCheckOut: string | null;

  @Column('character varying', {
    nullable: true,
    length: 100,
    name: 'longitude_check_in',
  })
  longitudeCheckIn: string | null;

  @Column('character varying', {
    nullable: true,
    length: 100,
    name: 'longitude_check_out',
  })
  longitudeCheckOut: string | null;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'check_in_date_time',
  })
  checkInDateTime: Date | null;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'check_out_date_time',
  })
  checkOutDateTime: Date | null;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'cancel_check_in_date_time',
  })
  cancelCheckInDateTime: Date | null;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'cancel_check_out_date_time',
  })
  cancelCheckOutDateTime: Date | null;

  @Column('boolean', {
    nullable: true,
    default: () => 'false',
    name: 'is_active',
  })
  isActive: boolean | null;

  @Column('bigint', {
    nullable: false,
    name: 'user_id_created',
  })
  userIdCreated: string;

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

  @Column('bigint', {
    nullable: true,
    name: 'customer_account_id',
  })
  customerAccountId: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'merchant_name',
  })
  merchantName: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'pickup_image',
  })
  pickupImage: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'pickup_signature',
  })
  pickupSignature: string | null;
}
