import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TmsBaseEntity } from './tms-base';

@Entity('attachment_tms', { schema: 'public' })
export class CodAwbRevision extends TmsBaseEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'cod_awb_revision_id',
  })
  codAwbRevisionId: string;

  @Column('bigint', {
    nullable: false,
    name: 'awb_id',
  })
  awbId: number;

  @Column('bigint', {
    nullable: false,
    name: 'awb_item_id',
  })
  awbItemId: number;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'awb_number',
  })
  awbNumber: string;

  @Column('float', {
    nullable: false,
    name: 'cod_value_current',
  })
  codValueCurrent: number;

  @Column('float', {
    nullable: false,
    name: 'cod_value',
  })
  codValue: number;

  @Column('bigint', {
    nullable: false,
    name: 'attachment_id',
  })
  attachmentId: number;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'created_time',
  })
  createdTime: Date;

  @Column('bigint', {
    nullable: false,
    name: 'user_id_created',
  })
  userIdCreated: number;

  @Column('bigint', {
    nullable: false,
    name: 'request_user_id',
  })
  requestUserId: number;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_deleted',
  })
  isDeleted: boolean;
}
