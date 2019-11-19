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

@Entity('pickup_request', { schema: 'public' })
@Index('pickup_request_last_request_idx', [
  'encrypt_address255',
  'partner_id',
  'pickup_request_date_time',
  'pickup_request_name',
])
@Index('pickup_request_partner_id', ['partner_id'])
@Index('pickup_request_pickup_request_status_id', ['pickup_request_status_id'])
@Index('pickup_request_pickup_schedule_date_time', [
  'pickup_schedule_date_time',
])
export class PickupRequest extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  pickup_request_id: string;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  pickup_request_code: string | null;

  @Column('character varying', {
    nullable: true,
    length: 500,

  })
  pickup_request_name: string | null;

  @Column('character varying', {
    nullable: true,
    length: 500,

  })
  pickup_request_email: string | null;

  @Column('character varying', {
    nullable: true,
    length: 100,

  })
  pickup_request_contact_no: string | null;

  @Column('text', {
    nullable: true,

  })
  pickup_request_address: string | null;

  @Column('timestamp without time zone', {
    nullable: true,

  })
  pickup_request_date_time: Date | null;

  @Column('timestamp without time zone', {
    nullable: true,

  })
  pickup_schedule_date_time: Date | null;

  @Column('text', {
    nullable: true,

  })
  pickup_request_notes: string | null;

  @Column('bigint', {
    nullable: true,

  })
  pickup_request_status_id: string | null;

  @Column('bigint', {
    nullable: true,

  })
  pickup_request_status_id_last: string | null;

  @Column('character varying', {
    nullable: true,
    length: 50,

  })
  pickup_request_type: string | null;

  @Column('character varying', {
    nullable: true,
    length: 200,

  })
  reference_no: string | null;

  @Column('timestamp without time zone', {
    nullable: true,

  })
  order_date_time: Date | null;

  @Column('timestamp without time zone', {
    nullable: true,

  })
  expired_date_time: Date | null;

  @Column('character varying', {
    nullable: true,
    length: 100,

  })
  encrypt_address100: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  encrypt_address255: string | null;

  @Column('character varying', {
    nullable: true,
    length: 500,

  })
  merchant_code: string | null;

  @Column('character varying', {
    nullable: true,
    length: 200,

  })
  reference_number: string | null;

  @Column('bigint', {
    nullable: true,

  })
  partner_id: string | null;

  @Column('integer', {
    nullable: true,

  })
  total_awb: number | null;

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

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  encrypt_merchant_name: string | null;
}
