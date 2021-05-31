import { TmsBaseEntity } from './tms-base';
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { AttachmentTms } from './attachment-tms';

@Entity('do_pod_return_attachment', { schema: 'public' })
export class DoPodReturnAttachment extends TmsBaseEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'do_pod_return_attachment_id',
  })
  doPodReturnAttachmentId: string;

  @Column('bigint', {
    nullable: false,
    name: 'attachment_tms_id',
  })
  attachmentTmsId: number | null;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'do_pod_return_detail_id',
  })
  doPodReturnDetailId: string;

  @Column('character varying', {
    nullable: false,
    length: 50,
    name: 'type',
  })
  type: string;

  @OneToOne(() => AttachmentTms)
  @JoinColumn({ name: 'attachment_tms_id', referencedColumnName: 'attachmentTmsId' })
  attachment: AttachmentTms;
}
