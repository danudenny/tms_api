import { BaseEntity, Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('awb_item_summary', { schema: 'public' })
@Index('awb_item_summary_awb_item_idx', ['awbItemId'])
@Index('awb_item_summary_is_deleted_idx', ['isDeleted'])
@Index('awb_item_summary_summary_date_idx', ['summaryDate'])
export class AwbItemSummary extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'awb_item_summary_id',
  })
  awbItemSummaryId: string;

  @Column('bigint', {
    nullable: true,
    name: 'awb_item_id',
  })
  awbItemId: string | null;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'summary_date',
  })
  summaryDate: Date | null;

  @Column('bigint', {
    nullable: true,
    name: 'awb_history_id_last',
  })
  awbHistoryIdLast: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'awb_status_id_last',
  })
  awbStatusIdLast: string | null;

  @Column('bigint', {
    nullable: false,
    default: () => '2000',
    name: 'awb_status_id_last_public',
  })
  awbStatusIdLastPublic: string;

  @Column('bigint', {
    nullable: true,
    name: 'user_id_last',
  })
  userIdLast: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'branch_id_last',
  })
  branchIdLast: string | null;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'history_date_last',
  })
  historyDateLast: Date | null;

  @Column('bigint', {
    nullable: false,
    name: 'user_id_created',
  })
  userIdCreated: string;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'created_time',
  })
  createdTime: Date;

  @Column('bigint', {
    nullable: false,
    name: 'user_id_updated',
  })
  userIdUpdated: string;

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
