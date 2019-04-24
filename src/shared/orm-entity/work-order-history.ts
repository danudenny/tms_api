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

@Entity('work_order_history', { schema: 'public' })
export class WorkOrderHistory extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  work_order_history_id: string;

  @Column('bigint', {
    nullable: false,

  })
  work_order_id: string;

  @Column('integer', {
    nullable: true,

  })
  work_order_seq: number | null;

  @Column('timestamp without time zone', {
    nullable: true,

  })
  work_order_date: Date | null;

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
  customer_account_id_child: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  guest_name: string | null;

  @Column('timestamp without time zone', {
    nullable: true,

  })
  pickup_schedule_date_time: Date | null;

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

  })
  total_assigned: number | null;

  @Column('boolean', {
    nullable: true,

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
  work_order_status_id: string;

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
  do_pickup_id_last: string | null;

  @Column('boolean', {
    nullable: true,
    default: () => 'false',

  })
  is_posted: boolean | null;

  @Column('integer', {
    nullable: true,

  })
  send_tracking_note: number | null;

  @Column('boolean', {
    nullable: true,
    default: () => 'false',

  })
  is_final: boolean | null;
}
