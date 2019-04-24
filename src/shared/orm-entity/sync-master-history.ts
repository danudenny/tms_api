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

@Entity('sync_master_history', { schema: 'public' })
export class SyncMasterHistory extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  sync_master_history_id: string;

  @Column('bigint', {
    nullable: false,

  })
  sync_master_id: string;

  @Column('character varying', {
    nullable: false,
    length: 255,

  })
  module: string;

  @Column('integer', {
    nullable: false,

  })
  page: number;

  @Column('integer', {
    nullable: false,

  })
  try_seq: number;

  @Column('character varying', {
    nullable: false,
    length: 255,

  })
  sync_url: string;

  @Column('integer', {
    nullable: false,

  })
  sync_status: number;

  @Column('timestamp without time zone', {
    nullable: false,

  })
  request_datetime: Date;

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
