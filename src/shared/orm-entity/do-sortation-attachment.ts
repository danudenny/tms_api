import { Column, Entity, PrimaryColumn } from 'typeorm';
import { TmsBaseEntity } from './tms-base';

@Entity('do_sortation_attachment', { schema: 'public' })
export class DoSortationAttachment extends TmsBaseEntity {
  @PrimaryColumn({
    type: 'uuid',
    name: 'do_sortation_attachment_id',
  })
  doSortationAttachmentId: string;

  @Column('integer', {
    nullable: false,
    name: 'attachment_tms_id',
  })
  attachmentTmsId: number;

  @Column({
    nullable: false,
    type: 'uuid',
    name: 'do_sortation_detail_id',
  })
  doSortationDetailId: string;

  @Column({
    nullable: false,
    type: 'uuid',
    name: 'do_sortation_vehicle_id',
  })
  doSortationVehicleId: string;

  @Column('character varying', {
    nullable: false,
    name: 'attachment_type',
  })
  attachmentType: string;

  @Column('bigint', {
    nullable: false,
    name: 'user_id_created',
  })
  userIdCreated: number;

  @Column('bigint', {
    nullable: false,
    name: 'user_id_updated',
  })
  userIdUpdated: number;

  @Column('boolean', {
    default: () => 'false',
    name: 'is_deleted',
  })
  isDeleted: boolean;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'created_time',
  })
  createdTime: Date;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'updated_time',
  })
  updatedTime: Date;
}
