import { BaseEntity, Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('awb_item_summary', { schema: 'public' })
@Index('awb_item_summary_awb_item_idx', ['awb_item_id'])
@Index('awb_item_summary_is_deleted_idx', ['is_deleted'])
@Index('awb_item_summary_summary_date_idx', ['summary_date'])
export class AwbItemSummary extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  awb_item_summary_id: string;

  @Column('bigint', {
    nullable: true,
  })
  awb_item_id: string | null;

  @Column('timestamp without time zone', {
    nullable: true,
  })
  summary_date: Date | null;

  @Column('bigint', {
    nullable: true,
  })
  awb_history_id_last: string | null;

  @Column('bigint', {
    nullable: true,
  })
  awb_status_id_last: string | null;

  @Column('bigint', {
    nullable: false,
    default: () => '2000',
  })
  awb_status_id_last_public: string;

  @Column('bigint', {
    nullable: true,
  })
  user_id_last: string | null;

  @Column('bigint', {
    nullable: true,
  })
  branch_id_last: string | null;

  @Column('timestamp without time zone', {
    nullable: true,
  })
  history_date_last: Date | null;

  @Column('bigint', {
    nullable: false,
  })
  user_id_created: string;

  @Column('timestamp without time zone', {
    nullable: false,
  })
  created_time: Date;

  @Column('bigint', {
    nullable: false,
  })
  user_id_updated: string;

  @Column('timestamp without time zone', {
    nullable: false,
  })
  updated_time: Date;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
  })
  is_deleted: boolean;
}
