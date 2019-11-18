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

@Entity('work_order', { schema: 'public' })
@Index('work_order_branch_id_assigned_idx', ['branch_id_assigned'])
@Index('work_order_customer_account_id_idx', ['customer_account_id'])
@Index('work_order_is_deleted_idx', ['is_deleted'])
export class WorkOrder extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  work_order_id: string;

  @Column('character varying', {
    nullable: false,
    length: 255,

  })
  work_order_code: string;

  @Column('timestamp without time zone', {
    nullable: false,

  })
  work_order_date: Date;

  @Column('bigint', {
    nullable: false,

  })
  user_id: string;

  @Column('bigint', {
    nullable: false,

  })
  branch_id: string;

  @Column('boolean', {
    nullable: false,

  })
  is_member: boolean;

  @Column('bigint', {
    nullable: true,

  })
  customer_account_id: string | null;

  @Column('bigint', {
    nullable: true,

  })
  customer_account_id_child: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  guest_name: string | null;

  @Column('timestamp without time zone', {
    nullable: false,

  })
  pickup_schedule_date_time: Date;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  pickup_phone: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  pickup_email: string | null;

  @Column('text', {
    nullable: true,

  })
  pickup_address: string | null;

  @Column('text', {
    nullable: true,

  })
  pickup_notes: string | null;

  @Column('bigint', {
    nullable: true,

  })
  branch_id_assigned: string | null;

  @Column('integer', {
    nullable: true,
    default: () => '0',

  })
  total_assigned: number | null;

  @Column('boolean', {
    nullable: true,
    default: () => 'false',

  })
  is_assigned: boolean | null;

  @Column('bigint', {
    nullable: true,

  })
  employee_id_driver: string | null;

  @Column('character varying', {
    nullable: true,
    length: 100,

  })
  latitude_last: string | null;

  @Column('character varying', {
    nullable: true,
    length: 100,

  })
  longitude_last: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  consignee_name: string | null;

  @Column('timestamp without time zone', {
    nullable: true,

  })
  received_date_time: Date | null;

  @Column('integer', {
    nullable: false,
    default: () => '0',

  })
  total_item: number;

  @Column('integer', {
    nullable: false,
    default: () => '0',

  })
  total_pickup_item: number;

  @Column('numeric', {
    nullable: false,
    default: () => '0',
    precision: 20,
    scale: 5,

  })
  total_weight: string;

  @Column('timestamp without time zone', {
    nullable: true,

  })
  history_date_time_last: Date | null;

  @Column('bigint', {
    nullable: true,

  })
  work_order_status_id_last: string | null;

  @Column('bigint', {
    nullable: true,

  })
  work_order_history_id_last: string | null;

  @Column('bigint', {
    nullable: true,

  })
  do_pickup_detail_id_last: string | null;

  @Column('character varying', {
    nullable: false,
    length: 50,

  })
  work_order_type: string;

  @Column('text', {
    nullable: true,

  })
  work_order_group: string | null;

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
    length: 100,

  })
  encrypt_address100: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  encrypt_address255: string | null;

  @Column('bigint', {
    nullable: true,

  })
  do_pickup_id_last: string | null;

  @Column('timestamp without time zone', {
    nullable: true,

  })
  pickup_date_time: Date | null;

  @Column('timestamp without time zone', {
    nullable: true,

  })
  check_in_date_time: Date | null;

  @Column('timestamp without time zone', {
    nullable: true,

  })
  check_out_date_time: Date | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  work_order_uid: string | null;

  @Column('bigint', {
    nullable: true,

  })
  reason_id: string | null;

  @Column('text', {
    nullable: true,

  })
  reason_note: string | null;

  @Column('integer', {
    nullable: true,
    default: () => '0',

  })
  total_awb_qty: number | null;

  @Column('bigint', {
    nullable: true,

  })
  work_order_status_id_pick: string | null;

  @Column('text', {
    nullable: true,

  })
  sigesit_notes: string | null;

  @Column('timestamp without time zone', {
    nullable: true,

  })
  drop_date_time: Date | null;

  @Column('boolean', {
    nullable: true,
    default: () => 'false',

  })
  is_final: boolean | null;
}
