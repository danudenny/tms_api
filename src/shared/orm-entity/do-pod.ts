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

@Entity('do_pod', { schema: 'public' })
export class DoPod extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  do_pod_id: string;

  @Column('character varying', {
    nullable: false,
    length: 255,

  })
  do_pod_code: string;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  ref_do_pod_code: string | null;

  @Column('timestamp without time zone', {
    nullable: false,

  })
  do_pod_date_time: Date;

  @Column('bigint', {
    nullable: false,

  })
  user_id: string;

  @Column('bigint', {
    nullable: false,

  })
  branch_id: string;

  @Column('bigint', {
    nullable: true,

  })
  branch_id_to: string | null;

  @Column('integer', {
    nullable: true,

  })
  total_assigned: number | null;

  @Column('bigint', {
    nullable: true,

  })
  user_id_driver: string | null;

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

  @Column('integer', {
    nullable: false,
    default: () => '0',

  })
  total_item: number;

  @Column('integer', {
    nullable: false,
    default: () => '0',

  })
  total_pod_item: number;

  @Column('numeric', {
    nullable: false,
    default: () => '0',
    precision: 20,
    scale: 5,

  })
  total_weight: string;

  @Column('bigint', {
    nullable: true,

  })
  do_pod_status_id_last: string | null;

  @Column('bigint', {
    nullable: true,

  })
  do_pod_history_id_last: string | null;

  @Column('timestamp without time zone', {
    nullable: true,

  })
  history_date_time_last: Date | null;

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
    nullable: true,

  })
  do_pod_type: number | null;

  @Column('integer', {
    nullable: true,

  })
  third_party_id: number | null;
}
