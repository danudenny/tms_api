import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('do_pod_history', { schema: 'public' })
export class DoPodHistory extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  do_pod_history_id: string;

  @Column('bigint', {
    nullable: false,

  })
  do_pod_id: string;

  @Column('timestamp without time zone', {
    nullable: true,

  })
  do_pod_date_time: Date | null;

  @Column('bigint', {
    nullable: false,

  })
  user_id: string;

  @Column('bigint', {
    nullable: false,

  })
  branch_id: string;

  @Column('boolean', {
    nullable: true,

  })
  is_member: boolean | null;

  @Column('bigint', {
    nullable: true,

  })
  customer_account_id: string | null;

  @Column('bigint', {
    nullable: true,

  })
  customer_account_merchant_id: string | null;

  @Column('integer', {
    nullable: true,

  })
  total_assigned: number | null;

  @Column('bigint', {
    nullable: true,

  })
  employee_id_driver: string | null;

  @Column('bigint', {
    nullable: true,

  })
  user_id_driver: string | null;

  @Column('character varying', {
    nullable: true,
    length: 100,

  })
  latitude: string | null;

  @Column('character varying', {
    nullable: true,
    length: 100,

  })
  longitude: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  consignee_name: string | null;

  @Column('timestamp without time zone', {
    nullable: true,

  })
  received_date_time: Date | null;

  @Column('numeric', {
    nullable: false,
    default: () => '0',
    precision: 20,
    scale: 5,

  })
  total_weight: string;

  @Column('text', {
    nullable: true,

  })
  history_notes: string | null;

  @Column('bigint', {
    nullable: true,

  })
  reason_id: string | null;

  @Column('bigint', {
    nullable: false,

  })
  do_pod_status_id: string;

  @Column('timestamp without time zone', {
    nullable: false,

  })
  history_date_time: Date;

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

  @Column('bigint', {
    nullable: true,

  })
  do_pod_detail_id: string | null;

  @Column('bigint', {
    nullable: true,

  })
  branch_id_to: string | null;

  @Column('integer', {
    nullable: true,

  })
  third_party_id: number | null;
}
