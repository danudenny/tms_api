import { Column, Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';

import { TmsBaseEntity } from './tms-base';
import { Branch } from './branch';
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

  @Column('character varying', {
    nullable: true,
    length: 50,
    name: 'seal_number',
  })
  sealNumber: string | null;

  @Column('integer', {
    nullable: true,
    name: 'branch_id_lastmile',
  })
  branchIdLastmile: number;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'chute_number',
  })
  chuteNumber: string;

  @Column('boolean', {
    nullable: true,
    default: () => 'false',
    name: 'is_cod',
  })
  isCod: boolean;

  @OneToOne(() => Branch)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @OneToOne(() => Branch)
  @JoinColumn({ name: 'branch_id_lastmile' })
  branchLastmile: Branch;
}
