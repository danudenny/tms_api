import { TmsBaseEntity } from './tms-base';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('do_pod_deliver_attachment', { schema: 'public' })
export class DoPodDeliverAttachment extends TmsBaseEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'do_pod_deliver_attachment_id',
  })
  doPodDeliverAttachmentId: string;

  @Column('bigint', {
    nullable: false,
    name: 'attachment_tms_id',
  })
  attachmentTmsId: number | null;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'do_pod_deliver_detail_id',
  })
  doPodDeliverDetailId: string;

  @Column('character varying', {
    nullable: false,
    length: 50,
    name: 'type',
  })
  type: string;
}
