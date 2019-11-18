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

@Entity('work_order_status', { schema: 'public' })
export class WorkOrderStatus extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  work_order_status_id: string;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  status_code: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  status_title: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  status_name: string | null;

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

  @Column('boolean', {
    nullable: true,
    default: () => 'false',

  })
  is_show_on_filter: boolean | null;
}
