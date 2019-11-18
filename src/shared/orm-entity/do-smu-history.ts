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

@Entity('do_smu_history', { schema: 'public' })
export class DoSmuHistory extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  do_smu_history_id: string;

  @Column('bigint', {
    nullable: false,

  })
  do_smu_id: string;

  @Column('bigint', {
    nullable: true,

  })
  do_smu_detail_id: string | null;

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
    nullable: true,

  })
  employee_id_driver: string | null;

  @Column('character varying', {
    nullable: true,
    length: 500,

  })
  latitude: string | null;

  @Column('character varying', {
    nullable: true,
    length: 500,

  })
  longitude: string | null;

  @Column('integer', {
    nullable: false,
    default: () => '1000',

  })
  do_smu_status_id: number;

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
