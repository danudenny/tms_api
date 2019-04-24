import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('do_pickup', { schema: 'public' })
export class DoPickup extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  do_pickup_id: string;

  @Column('timestamp without time zone', {
    nullable: false,

  })
  do_pickup_date: Date;

  @Column('bigint', {
    nullable: false,

  })
  user_id: string;

  @Column('bigint', {
    nullable: false,

  })
  branch_id: string;

  @Column('bigint', {
    nullable: false,

  })
  employee_id: string;

  @Column('character varying', {
    nullable: true,
    length: 500,

  })
  work_order_group: string | null;

  @Column('character varying', {
    nullable: true,
    length: 500,

  })
  work_order_group_encrypt: string | null;

  @Column('character varying', {
    nullable: true,
    length: 100,

  })
  latitude_check_in: string | null;

  @Column('character varying', {
    nullable: true,
    length: 100,

  })
  latitude_check_out: string | null;

  @Column('character varying', {
    nullable: true,
    length: 100,

  })
  longitude_check_in: string | null;

  @Column('character varying', {
    nullable: true,
    length: 100,

  })
  longitude_check_out: string | null;

  @Column('timestamp without time zone', {
    nullable: true,

  })
  check_in_date_time: Date | null;

  @Column('timestamp without time zone', {
    nullable: true,

  })
  check_out_date_time: Date | null;

  @Column('timestamp without time zone', {
    nullable: true,

  })
  cancel_check_in_date_time: Date | null;

  @Column('timestamp without time zone', {
    nullable: true,

  })
  cancel_check_out_date_time: Date | null;

  @Column('boolean', {
    nullable: true,
    default: () => 'false',

  })
  is_active: boolean | null;

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
  customer_account_id: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  merchant_name: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  pickup_image: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  pickup_signature: string | null;
}
