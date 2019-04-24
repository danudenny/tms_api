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

@Entity('work_order_detail', { schema: 'public' })
export class WorkOrderDetail extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  work_order_detail_id: string;

  @Column('bigint', {
    nullable: false,

  })
  work_order_id: string;

  @Column('bigint', {
    nullable: true,

  })
  pickup_request_id: string | null;

  @Column('bigint', {
    nullable: true,

  })
  awb_item_id: string | null;

  @Column('bigint', {
    nullable: true,

  })
  work_order_status_id_last: string | null;

  @Column('bigint', {
    nullable: true,

  })
  reason_id: string | null;

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

  @Column('bigint', {
    nullable: true,

  })
  work_order_status_id_pick: string | null;

  @Column('timestamp without time zone', {
    nullable: true,

  })
  drop_date_time: Date | null;

  @Column('character varying', {
    nullable: true,
    length: 100,

  })
  ref_awb_number: string | null;
}
