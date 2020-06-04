import { TmsBaseEntity } from './tms-base';
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { AttachmentTms } from './attachment-tms';
import { DoPodDeliver } from './do-pod-deliver';
import { DoPodDeliverDetail } from './do-pod-deliver-detail';

@Entity('do_smd_detail_attachment', { schema: 'public' })
export class DoSmdDetailAttachment extends TmsBaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'do_smd_detail_attachment_id',
  })
  doSmdDetailAttachmentId: number;

  @Column('bigint', {
    nullable: false,
    name: 'attachment_tms_id',
  })
  attachmentTmsId: number | null;

  @Column('bigint', {
    nullable: false,
    name: 'do_smd_detail_id',
  })
  doSmdDetailId: number | null;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'attachment_type',
  })
  attachmentType: string;

  // @ManyToOne(() => DoPodDeliverDetail)
  // @JoinColumn({ name: 'do_pod_deliver_detail_id' })
  // doPodDeliverDetail: DoPodDeliverDetail;

  @OneToOne(() => AttachmentTms)
  @JoinColumn({ name: 'attachment_tms_id', referencedColumnName: 'attachmentTmsId' })
  attachment: AttachmentTms;
}
