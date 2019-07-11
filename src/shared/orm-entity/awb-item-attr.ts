import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('awb_item_attr', { schema: 'public' })
export class AwbDetail extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  awb_item_attr_id: string;

  @Column('bigint', {
    nullable: false,
  })
  awb_attr_id: number;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'awb_number',
  })
  awbNumber: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'awb_number_pl',
  })
  awbNumberPl: string;

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
    nullable: true,
    name: 'awb_status_id_last_public',
  })
  awbStatusIdLastPublic: number | null;

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

  @Column('bigint', {
    nullable: true,
    name: 'lead_time_run_days',
  })
  leadTimeRunDays: number | null;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'history_date_last',
    })
  historyDateLast: Date;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'final_status_date',
    })
  finalStatusDate: Date;

  @Column('bigint', {
    nullable: true,
    name: 'lead_time_final_days',
  })
  leadTimeFinalDays: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'awb_status_id_final',
  })
  awbStatusIdFinal: number | null;

  @Column('bigint', {
    nullable: false,
  })
  uuid: number | null;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'update_time',
    })
  updateTime: Date;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
  })
  is_deleted: boolean;

  @Column('character varying', {
    nullable: true,
    length: 255,
  })
  try_attempt: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'branch_id_next',
  })
  branchIdNext: number | null;
}
