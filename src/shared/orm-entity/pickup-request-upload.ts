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

@Entity('pickup_request_upload', { schema: 'public' })
export class PickupRequestUpload extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  pickup_request_upload_id: string;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  pickup_request_upload_code: string | null;

  @Column('character varying', {
    nullable: true,
    length: 500,

  })
  pickup_request_upload_name: string | null;

  @Column('character varying', {
    nullable: true,
    length: 500,

  })
  pickup_request_upload_email: string | null;

  @Column('character varying', {
    nullable: true,
    length: 100,

  })
  pickup_request_upload_contact_no: string | null;

  @Column('text', {
    nullable: true,

  })
  pickup_request_upload_address: string | null;

  @Column('timestamp without time zone', {
    nullable: true,

  })
  pickup_request_upload_date_time: Date | null;

  @Column('timestamp without time zone', {
    nullable: true,

  })
  pickup_schedule_date_time: Date | null;

  @Column('text', {
    nullable: true,

  })
  pickup_request_upload_notes: string | null;

  @Column('bigint', {
    nullable: true,

  })
  pickup_request_upload_status_id: string | null;

  @Column('bigint', {
    nullable: true,

  })
  pickup_request_upload_status_id_last: string | null;

  @Column('character varying', {
    nullable: true,
    length: 50,

  })
  pickup_request_upload_type: string | null;

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
