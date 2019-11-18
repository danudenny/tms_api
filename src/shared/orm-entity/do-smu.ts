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

@Entity('do_smu', { schema: 'public' })
export class DoSmu extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  do_smu_id: string;

  @Column('bigint', {
    nullable: true,

  })
  do_smu_id_parent: string | null;

  @Column('integer', {
    nullable: false,
    default: () => '10',

  })
  do_smu_type: number;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  do_smu_code: string | null;

  @Column('timestamp without time zone', {
    nullable: false,

  })
  do_smu_time: Date;

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
  employee_id_driver: string;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  vehicle_number: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  vehicle_city_label: string | null;

  @Column('character varying', {
    nullable: false,
    length: 500,

  })
  scan_vehicle: string;

  @Column('character varying', {
    nullable: false,
    length: 500,

  })
  scan_driver: string;

  @Column('bigint', {
    nullable: true,

  })
  attachment_tms_id_airport_receipt: string | null;

  @Column('numeric', {
    nullable: false,
    default: () => '0',
    precision: 10,
    scale: 5,

  })
  airport_receipt_amount: string;

  @Column('bigint', {
    nullable: true,

  })
  do_smu_history_id: string | null;

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

  @Column('integer', {
    nullable: false,
    default: () => '0',

  })
  total_item: number;

  @Column('numeric', {
    nullable: true,
    precision: 10,
    scale: 5,

  })
  total_weight: string | null;

  @Column('character varying', {
    nullable: false,
    length: 500,

  })
  vehicle_branch_scan: string;
}
