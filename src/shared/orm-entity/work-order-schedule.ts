import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('work_order_schedule', { schema: 'public' })
export class WorkOrderSchedule extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'work_order_schedule_id',
  })
  workOrderScheduleId: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'work_order_schedule_code',
  })
  workOrderScheduleCode: string;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'work_order_schedule_date',
  })
  workOrderScheduleDate: Date;

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

  @Column('boolean', {
    nullable: false,
    name: 'is_member',
  })
  isMember: boolean;

  @Column('bigint', {
    nullable: true,
    name: 'customer_account_id',
  })
  customerAccountId: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'customer_account_id_child',
  })
  customerAccountIdChild: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'guest_name',
  })
  guestName: string | null;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'pickup_active_date',
  })
  pickupActiveDate: Date;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'pickup_phone',
  })
  pickupPhone: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'pickup_email',
  })
  pickupEmail: string | null;

  @Column('text', {
    nullable: true,
    name: 'pickup_address',
  })
  pickupAddress: string | null;

  @Column('text', {
    nullable: true,
    name: 'pickup_notes',
  })
  pickupNotes: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'branch_id_assigned',
  })
  branchIdAssigned: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'employee_id_driver',
  })
  employeeIdDriver: string | null;

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

  @Column('boolean', {
    nullable: true,
    name: 'is_monday',
  })
  isMonday: boolean | null;

  @Column('boolean', {
    nullable: true,
    name: 'is_tuesday',
  })
  isTuesday: boolean | null;

  @Column('boolean', {
    nullable: true,
    name: 'is_wednesday',
  })
  isWednesday: boolean | null;

  @Column('boolean', {
    nullable: true,
    name: 'is_thursday',
  })
  isThursday: boolean | null;

  @Column('boolean', {
    nullable: true,
    name: 'is_friday',
  })
  isFriday: boolean | null;

  @Column('boolean', {
    nullable: true,
    name: 'is_saturday',
  })
  isSaturday: boolean | null;

  @Column('boolean', {
    nullable: true,
    name: 'is_sunday',
  })
  isSunday: boolean | null;

  @Column('time without time zone', {
    nullable: true,
    name: 'pickup_time_monday',
  })
  pickupTimeMonday: string | null;

  @Column('time without time zone', {
    nullable: true,
    name: 'pickup_time_tuesday',
  })
  pickupTimeTuesday: string | null;

  @Column('time without time zone', {
    nullable: true,
    name: 'pickup_time_wednesday',
  })
  pickupTimeWednesday: string | null;

  @Column('time without time zone', {
    nullable: true,
    name: 'pickup_time_thursday',
  })
  pickupTimeThursday: string | null;

  @Column('time without time zone', {
    nullable: true,
    name: 'pickup_time_friday',
  })
  pickupTimeFriday: string | null;

  @Column('time without time zone', {
    nullable: true,
    name: 'pickup_time_saturday',
  })
  pickupTimeSaturday: string | null;

  @Column('time without time zone', {
    nullable: true,
    name: 'pickup_time_sunday',
  })
  pickupTimeSunday: string | null;

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
    name: 'work_order_id_last',
  })
  workOrderIdLast: string | null;
}
