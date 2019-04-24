import { BaseEntity, Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('awb_history', { schema: 'public' })
@Index('awb_history_item_idx', ['awb_item_id'])
@Index('awb_history_status_idx', ['awb_status_id'])
export class AwbHistory extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  awb_history_id: string;

  @Column('bigint', {
    nullable: true,
  })
  awb_item_id: string | null;

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

  @Column('character varying', {
    nullable: true,
    length: 255,
  })
  ref_table: string | null;

  @Column('bigint', {
    nullable: true,
  })
  ref_id: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
  })
  ref_module: string | null;

  @Column('bigint', {
    nullable: true,
  })
  employee_id_driver: string | null;

  @Column('boolean', {
    nullable: true,
    default: () => 'true',
  })
  is_scan_single: boolean | null;

  @Column('boolean', {
    nullable: true,
    default: () => 'false',
  })
  is_direction_back: boolean | null;

  @Column('character varying', {
    nullable: true,
    length: 500,
  })
  latitude: string | null;

  @Column('character varying', {
    nullable: true,
    length: 500,
  })
  longitude: string | null;

  @Column('bigint', {
    nullable: true,
  })
  awb_history_id_prev: string | null;
}
