import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { TmsBaseEntity } from './tms-base';

@Entity('awb_item_summary', { schema: 'public' })
@Index('awb_item_summary_awb_item_idx', ['awbItemId'])
@Index('awb_item_summary_is_deleted_idx', ['isDeleted'])
@Index('awb_item_summary_summary_date_idx', ['summaryDate'])
export class AwbItemSummary extends TmsBaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'awb_item_summary_id',
  })
  awbItemSummaryId: number;

  @Column('bigint', {
    nullable: true,
    name: 'awb_item_id',
  })
  awbItemId: number | null;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'summary_date',
  })
  summaryDate: Date | null;

  @Column('bigint', {
    nullable: true,
    name: 'awb_history_id_last',
  })
  awbHistoryIdLast: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'awb_status_id_last',
  })
  awbStatusIdLast: number | null;

  @Column('bigint', {
    nullable: false,
    default: () => '2000',
    name: 'awb_status_id_last_public',
  })
  awbStatusIdLastPublic: number;

  @Column('bigint', {
    nullable: true,
    name: 'user_id_last',
  })
  userIdLast: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'branch_id_last',
  })
  branchIdLast: number | null;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'history_date_last',
  })
  historyDateLast: Date | null;

  @Column('bigint', {
    nullable: false,
    name: 'user_id_created',
  })
  userIdCreated: number;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'created_time',
  })
  createdTime: Date;

  @Column('bigint', {
    nullable: false,
    name: 'user_id_updated',
  })
  userIdUpdated: number;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'updated_time',
  })
  updatedTime: Date;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_deleted',
  })
  isDeleted: boolean;
}
