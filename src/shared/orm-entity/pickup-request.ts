
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CustomerMembershipDetail } from './customer-membership-detail';
import { Partner } from './partner';
import { TmsBaseEntity } from './tms-base';

@Entity('pickup_request', { schema: 'public' })
@Index('pickup_request_last_request_idx', [
  'encryptAddress255',
  'partnerId',
  'pickupRequestDateTime',
  'pickupRequestName',
])
@Index('pickup_request_partner_id', ['partnerId'])
@Index('pickup_request_pickup_request_status_id', ['pickupRequestStatusId'])
@Index('pickup_request_pickup_schedule_date_time', [
  'pickupScheduleDateTime',
])
export class PickupRequest extends TmsBaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'pickup_request_id',
  })
  pickupRequestId: number;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'pickup_request_code',
  })
  pickupRequestCode: string | null;

  @Column('character varying', {
    nullable: true,
    length: 500,
    name: 'pickup_request_name',
  })
  pickupRequestName: string | null;

  @Column('character varying', {
    nullable: true,
    length: 500,
    name: 'pickup_request_email',
  })
  pickupRequestEmail: string | null;

  @Column('character varying', {
    nullable: true,
    length: 100,
    name: 'pickup_request_contact_no',
  })
  pickupRequestContactNo: string | null;

  @Column('text', {
    nullable: true,
    name: 'pickup_request_address',
  })
  pickupRequestAddress: string | null;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'pickup_request_date_time',
  })
  pickupRequestDateTime: Date | null;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'pickup_schedule_date_time',
  })
  pickupScheduleDateTime: Date | null;

  @Column('text', {
    nullable: true,
    name: 'pickup_request_notes',
  })
  pickupRequestNotes: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'pickup_request_status_id',
  })
  pickupRequestStatusId: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'pickup_request_status_id_last',
  })
  pickupRequestStatusIdLast: number | null;

  @Column('character varying', {
    nullable: true,
    length: 50,
    name: 'pickup_request_type',
  })
  pickupRequestType: string | null;

  @Column('character varying', {
    nullable: true,
    length: 200,
    name: 'reference_no',
  })
  referenceNo: string | null;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'order_date_time',
  })
  orderDateTime: Date | null;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'expired_date_time',
  })
  expiredDateTime: Date | null;

  @Column('character varying', {
    nullable: true,
    length: 100,
    name: 'encrypt_address100',
  })
  encryptAddress100: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'encrypt_address255',
  })
  encryptAddress255: string | null;

  @Column('character varying', {
    nullable: true,
    length: 500,
    name: 'merchant_code',
  })
  merchantCode: string | null;

  @Column('character varying', {
    nullable: true,
    length: 200,
    name: 'reference_number',
  })
  referenceNumber: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'partner_id',
  })
  partnerId: number | null;

  @Column('integer', {
    nullable: true,
    name: 'total_awb',
  })
  totalAwb: number | null;

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

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'encrypt_merchant_name',
  })
  encryptMerchantName: string | null;

  @OneToOne(() => Partner)
  @JoinColumn({ name: 'partner_id', referencedColumnName: 'partner_id' })
  partner: Partner;

  @OneToOne(() => CustomerMembershipDetail)
  @JoinColumn({ name: 'partner_id', referencedColumnName: 'partnerId' })
  @JoinColumn({ name: 'pickup_request_email', referencedColumnName: 'email' })
  customerMembershipDetail: CustomerMembershipDetail;

  
}
