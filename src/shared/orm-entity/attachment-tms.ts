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
  })
  filename: string | null;

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
