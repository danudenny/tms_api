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

@Entity('do_smu_status', { schema: 'public' })
export class DoSmuStatus extends BaseEntity {
  @Column('integer', {
    nullable: false,
    primary: true,

  })
  do_smu_status_id: number;

  @Column('character varying', {
    nullable: false,
    length: 255,

  })
  do_smu_status_name: string;

  @Column('character varying', {
    nullable: false,
    length: 255,

  })
  do_smu_status_title: string;

  @Column('character varying', {
    nullable: false,
    length: 500,

  })
  do_smu_status_desc: string;

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
}
