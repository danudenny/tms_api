import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TmsBaseEntity } from './tms-base';

@Entity('cod_awb_revision', { schema: 'public' })
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
  attachmentId: number | null;

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
