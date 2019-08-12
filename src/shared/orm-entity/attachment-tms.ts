import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { TmsBaseEntity } from './tms-base';

@Entity('attachment_tms', { schema: 'public' })
export class AttachmentTms extends TmsBaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'attachment_tms_id',
  })
  attachmentTmsId: string;

  @Column('character varying', {
    nullable: true,
    length: 500,
  })
  url: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'attachment_path',
  })
  attachmentPath: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'attachment_name',
  })
  attachmentName: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'filename',
  })
  fileName: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'file_mime',
  })
  fileMime: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'file_provider',
  })
  fileProvider: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 's3_bucket_name',
  })
  s3BucketName: string | null;

  @Column('text', {
    nullable: true,
  })
  description: string | null;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_used',
  })
  isUsed: boolean;
}
