import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { AwbItemAttr } from './awb-item-attr';
import { AwbStatus } from './awb-status';

@Entity('awb_attr', { schema: 'public' })
export class AwbAttr extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'awb_attr_id',
  })
  awbAttrId: number;

  @Column('bigint', {
    nullable: true,
    name: 'awb_id',
  })
  awbId: number | null;

  // @Column('character varying', {
  //   nullable: false,
  //   length: 255,
  //   name: 'awb_number_pl',
  // })
  // awbNumberPl: string;

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
    nullable: false,
    name: 'lead_time_run_days',
  })
  leadTimeRunDays: number;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'history_date_last',
    })
  historyDateLast: Date | null;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'final_status_date',
    })
  finalStatusDate: Date | null;

  @Column('bigint', {
    nullable: true,
    name: 'awb_status_id_final',
  })
  awbStatusIdFinal: number | null;

  @Column('bigint', {
    nullable: false,
    name: 'lead_time_final_days',
  })
  leadTimeFinalDays: number;

  @Column('character varying', {
    nullable: true,
  })
  uuid: string | null;

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

  @Column('bigint', {
    nullable: false,
    name: 'try_attempt',
  })
  tryAttempt: number;

  @Column('bigint', {
    nullable: true,
    name: 'branch_id_next',
  })
  branchIdNext: number | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'awb_number',
  })
  awbNumber: string | null;

  @OneToOne(() => AwbItemAttr)
  @JoinColumn({ name: 'awb_attr_id' })
  awbItemAttr: AwbItemAttr;

  @OneToOne(() => AwbStatus)
  @JoinColumn({ name: 'awb_status_id_last' })
  awbStatus: AwbStatus;
}
