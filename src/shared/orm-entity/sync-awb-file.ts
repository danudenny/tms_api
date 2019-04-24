import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('sync_awb_file', { schema: 'public' })
export class SyncAwbFile extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'sync_awb_file_id',
  })
  syncAwbFileId: string;

  @Column('bigint', {
    nullable: false,
    name: 'sync_id',
  })
  syncId: string;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'download_date',
  })
  downloadDate: Date | null;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'filename',
  })
  filename: string;

  @Column('text', {
    nullable: true,
    name: 'url',
  })
  url: string | null;

  @Column('text', {
    nullable: true,
    name: 'error_message',
  })
  errorMessage: string | null;

  @Column('integer', {
    nullable: false,
    default: () => '0',
    name: 'total_update',
  })
  totalUpdate: number;

  @Column('integer', {
    nullable: false,
    default: () => '0',
    name: 'total_insert',
  })
  totalInsert: number;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_done',
  })
  isDone: boolean;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_dead',
  })
  isDead: boolean;
}
