import { TmsBaseEntity } from './tms-base';
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { AttachmentTms } from './attachment-tms';
import { DoPodDeliver } from './do-pod-deliver';
import { DoPodDeliverDetail } from './do-pod-deliver-detail';

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

  @ManyToOne(() => DoPodDeliverDetail)
  @JoinColumn({ name: 'do_pod_deliver_detail_id' })
  doPodDeliverDetail: DoPodDeliverDetail;

  @OneToOne(() => AttachmentTms)
  @JoinColumn({ name: 'attachment_tms_id', referencedColumnName: 'attachmentTmsId' })
  attachment: AttachmentTms;
}
