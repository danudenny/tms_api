import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Awb } from './awb';

import { AwbCheckSummary } from './awb-check-summary';
import { TmsBaseEntity } from './tms-base';

@Entity('awb_check_log', { schema: 'public' })
export class AwbCheckLog extends TmsBaseEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'awb_check_log_id',
  })
  id: string;

  @Column('uuid', {
    nullable: false,
    name: 'awb_check_summary_id',
  })
  awbCheckSummaryId: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'awb_number',
  })
  awbNumber: string;

  @ManyToOne(() => AwbCheckSummary, summary => summary.checkLogs)
  @JoinColumn({ name: 'awb_check_summary_id' })
  summary: AwbCheckSummary;

  @OneToOne(() => Awb, e => e.awbNumber)
  @JoinColumn({ name: 'awb_number', referencedColumnName: 'awbNumber' })
  awb: Awb;
}
