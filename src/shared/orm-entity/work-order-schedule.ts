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

@Entity('work_order_schedule', { schema: 'public' })
export class WorkOrderSchedule extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  work_order_schedule_id: string;

  @Column('character varying', {
    nullable: false,
    length: 255,

  })
  work_order_schedule_code: string;

  @Column('timestamp without time zone', {
    nullable: false,

  })
  work_order_schedule_date: Date;

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
  pickup_active_date: Date;

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

  @Column('bigint', {
    nullable: true,

  })
  employee_id_driver: string | null;

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

  @Column('boolean', {
    nullable: true,

  })
  is_monday: boolean | null;

  @Column('boolean', {
    nullable: true,

  })
  is_tuesday: boolean | null;

  @Column('boolean', {
    nullable: true,

  })
  is_wednesday: boolean | null;

  @Column('boolean', {
    nullable: true,

  })
  is_thursday: boolean | null;

  @Column('boolean', {
    nullable: true,

  })
  is_friday: boolean | null;

  @Column('boolean', {
    nullable: true,

  })
  is_saturday: boolean | null;

  @Column('boolean', {
    nullable: true,

  })
  is_sunday: boolean | null;

  @Column('time without time zone', {
    nullable: true,

  })
  pickup_time_monday: string | null;

  @Column('time without time zone', {
    nullable: true,

  })
  pickup_time_tuesday: string | null;

  @Column('time without time zone', {
    nullable: true,

  })
  pickup_time_wednesday: string | null;

  @Column('time without time zone', {
    nullable: true,

  })
  pickup_time_thursday: string | null;

  @Column('time without time zone', {
    nullable: true,

  })
  pickup_time_friday: string | null;

  @Column('time without time zone', {
    nullable: true,

  })
  pickup_time_saturday: string | null;

  @Column('time without time zone', {
    nullable: true,

  })
  pickup_time_sunday: string | null;

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
  work_order_id_last: string | null;
}
