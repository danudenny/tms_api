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

@Entity('sync_master', { schema: 'public' })
export class SyncMaster extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  sync_master_id: string;

  @Column('character varying', {
    nullable: false,
    length: 255,

  })
  module: string;

  @Column('character varying', {
    nullable: false,
    length: 255,

  })
  session_id: string;

  @Column('timestamp without time zone', {
    nullable: false,

  })
  sync_last_updated: Date;

  @Column('integer', {
    nullable: false,

  })
  limit_data: number;

  @Column('integer', {
    nullable: false,

  })
  total_pages: number;

  @Column('integer', {
    nullable: false,

  })
  total_data: number;

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
  sync_start_updated: Date | null;
}
