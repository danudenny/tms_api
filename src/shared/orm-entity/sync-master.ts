import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('sync_master', { schema: 'public' })
export class SyncMaster extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'sync_master_id',
  })
  syncMasterId: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'module',
  })
  module: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'session_id',
  })
  sessionId: string;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'sync_last_updated',
  })
  syncLastUpdated: Date;

  @Column('integer', {
    nullable: false,
    name: 'limit_data',
  })
  limitData: number;

  @Column('integer', {
    nullable: false,
    name: 'total_pages',
  })
  totalPages: number;

  @Column('integer', {
    nullable: false,
    name: 'total_data',
  })
  totalData: number;

  @Column('bigint', {
    nullable: false,
    name: 'user_id_created',
  })
  userIdCreated: string;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'created_time',
  })
  createdTime: Date;

  @Column('bigint', {
    nullable: false,
    name: 'user_id_updated',
  })
  userIdUpdated: string;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'updated_time',
  })
  updatedTime: Date;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_deleted',
  })
  isDeleted: boolean;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'sync_start_updated',
  })
  syncStartUpdated: Date | null;
}
