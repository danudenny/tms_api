import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { AwbItemAttr } from './awb-item-attr';

@Entity('awb_attr', { schema: 'public' })
export class AwbAttr extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'awb_attr_id',
  })
  awbAttrId: string;

  @Column('bigint', {
    nullable: false,
    name: 'awb_id',
  })
  awbId: number;

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
    name: 'is_deleted',
  })
  isDeleted: boolean;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'try_attempt',
  })
  tryAttempt: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'branch_id_next',
  })
  branchIdNext: number | null;

  @OneToOne(() => AwbItemAttr)
  @JoinColumn({ name: 'awb_attr_id' })
  awbItemAttr: AwbItemAttr;
}
