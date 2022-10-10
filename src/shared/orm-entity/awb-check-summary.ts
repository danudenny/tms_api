import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AwbCheckLog } from './awb-check-log';

import { TmsBaseEntity } from './tms-base';

@Entity('awb_check_summary', { schema: 'public' })
export class AwbCheckSummary extends TmsBaseEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'awb_check_summary_id',
  })
  id: string;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'start_time',
  })
  startTime: Date;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'end_time',
  })
  endTime: Date;

  @Column('integer', {
    nullable: false,
    name: 'branch_id',
  })
  branchId: number;

  @Column('integer', {
    nullable: false,
    name: 'logs',
    default: 0,
  })
  logs: number;

  @OneToMany(() => AwbCheckLog, log => log.summary)
  checkLogs: AwbCheckLog;
}
