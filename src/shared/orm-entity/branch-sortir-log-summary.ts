import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { TmsBaseEntity } from './tms-base';
@Entity('branch_sortir_log_summary', { schema: 'public' })
export class BranchSortirLogSummary extends TmsBaseEntity {
  @PrimaryGeneratedColumn({
    type: 'uuid',
    name: 'branch_sortir_log_summary_id',
  })
  branchSortirLogSummaryId: string;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'scan_date',
  })
  scanDate: Date;

  @Column('integer', {
    nullable: false,
    name: 'branch_id',
  })
  branchId: number;

  @Column('character varying', {
    nullable: false,
    length: 30,
    name: 'awb_number',
  })
  awbNumber: string;

  @Column('integer', {
    nullable: false,
    name: 'is_succeed',
    default: () => '0',
  })
  isSucceed: number;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'reason',
  })
  reason: string | null;
}
