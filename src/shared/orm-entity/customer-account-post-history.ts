import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('customer_account_post_history', { schema: 'public' })
export class CustomerAccountPostHistory extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  customer_account_post_history_id: string;

  @Column('bigint', {
    nullable: false,

  })
  awb_history_id: string;

  @Column('bigint', {
    nullable: true,

  })
  awb_id: string | null;

  @Column('bigint', {
    nullable: true,

  })
  awb_detail_id: string | null;

  @Column('bigint', {
    nullable: true,

  })
  user_id: string | null;

  @Column('bigint', {
    nullable: true,

  })
  branch_id: string | null;

  @Column('timestamp without time zone', {
    nullable: false,

  })
  history_date: Date;

  @Column('bigint', {
    nullable: true,

  })
  awb_status_id: string | null;

  @Column('text', {
    nullable: true,

  })
  awb_note: string | null;

  @Column('bigint', {
    nullable: true,

  })
  customer_account_id: string | null;

  @Column('bigint', {
    nullable: true,

  })
  ref_id_tracking_note: string | null;

  @Column('bigint', {
    nullable: true,

  })
  ref_id_tracking_site: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  ref_id_cust_package: string | null;

  @Column('character varying', {
    nullable: true,
    length: 50,

  })
  ref_awb_number: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  ref_tracking_site_code: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  ref_tracking_site_name: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  ref_partner_name: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  ref_recipient_name: string | null;

  @Column('bigint', {
    nullable: true,

  })
  ref_id_courier: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  ref_courier_name: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  ref_tracking_type: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  ref_user_created: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  ref_user_updated: string | null;

  @Column('text', {
    nullable: true,

  })
  request_body: string | null;

  @Column('integer', {
    nullable: true,
    default: () => '0',

  })
  status_post: number | null;

  @Column('bigint', {
    nullable: false,

  })
  user_id_created: string;

  @Column('timestamp without time zone', {
    nullable: false,

  })
  created_time: Date;

  @Column('bigint', {
    nullable: false,

  })
  user_id_updated: string;

  @Column('timestamp without time zone', {
    nullable: false,

  })
  updated_time: Date;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',

  })
  is_deleted: boolean;

  @Column('text', {
    nullable: true,

  })
  response_body: string | null;

  @Column('character varying', {
    nullable: true,
    length: 500,
    default: () => 'NULL::character varying',

  })
  post_history_code: string | null;
}
