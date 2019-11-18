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

@Entity('log_history', { schema: 'public' })
export class LogHistory extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  log_history_id: string;

  @Column('character varying', {
    nullable: false,
    length: 255,

  })
  table_name: string;

  @Column('bigint', {
    nullable: false,

  })
  reference_id: string;

  @Column('character varying', {
    nullable: false,
    length: 255,

  })
  field_name: string;

  @Column('text', {
    nullable: true,

  })
  value_before: string | null;

  @Column('text', {
    nullable: true,

  })
  value_after: string | null;

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
