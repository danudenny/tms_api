import { Column, Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { TmsBaseEntity } from './tms-base';

@Entity('pod_awb_attachment', { schema: 'public' })
export class PodAwbAttachment extends TmsBaseEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'id',
  })
  id: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'awb_number',
  })
  awbNumber: string;

  @Column('bigint', {
    nullable: false,
    name: 'awb_item_id',
  })
  awbItemId: number;

  @Column('bigint', {
    nullable: false,
    name: 'attachment_tms_id',
  })
  attachmentTmsId: number | null;

  @Column('bigint', {
    nullable: false,
    name: 'awb_status_id',
  })
  awbStatusId: number | null;

  @Column('character varying', {
    nullable: false,
    length: 100,
    name: 'photo_type',
  })
  photoType: string | null;
}