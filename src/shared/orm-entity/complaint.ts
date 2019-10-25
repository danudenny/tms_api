import { Column, Entity, PrimaryGeneratedColumn, BaseEntity, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { AttachmentTms } from './attachment-tms';

@Entity('complaint', { schema: 'public' })
export class Complaint extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'complaint_id',
  })
  complaintId: string;

  @Column('character varying', {
    nullable: false,
  })
  url: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
  })
  subject: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
  })
  recipient: string;

  @Column('bigint', {
    nullable: false,
    name: 'attachment_id',
  })
  attachmentId: number;

  @Column('text', {
    nullable: true,
  })
  description: string | null;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'created_time',
  })
  createdTime: Date;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_deleted',
  })
  isDeleted: boolean;

  @OneToOne(() => AttachmentTms)
  @JoinColumn({ name: 'attachment_id', referencedColumnName: 'attachmentTmsId' })
  attachment: AttachmentTms;
}
