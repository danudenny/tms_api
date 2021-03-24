import { Column, Entity, PrimaryGeneratedColumn, JoinColumn, OneToMany, ManyToOne } from 'typeorm';

import { TmsBaseEntity } from './tms-base';
import { BranchSortirLog } from './branch-sortir-log';

@Entity('branch_sortir_log_detail', { schema: 'public' })
export class BranchSortirLogDetail extends TmsBaseEntity {
  @PrimaryGeneratedColumn({
    type: 'uuid',
    name: 'branch_sortir_log_detail_id',
  })
  branchSortirLogDetailId: string;

  @Column('uuid', {
    nullable: false,
    name: 'branch_sortir_log_id',
  })
  branchSortirLogId: string;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'scan_date',
  })
  scanDate: Date;

  @Column('bigint', {
    nullable: false,
    name: 'branch_id',
  })
  branchId: number;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'awb_number',
  })
  awbNumber: string;

  @Column('integer', {
    nullable: true,
    name: 'no_chute',
  })
  noChute: number;

  @Column('bigint', {
    nullable: true,
    name: 'branch_id_lastmile',
  })
  branchIdLastmile: number;

  @Column('boolean', {
    nullable: true,
    default: () => 'false',
    name: 'is_cod',
  })
  isCod: boolean;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_succeed',
  })
  isSucceed: boolean;

  @Column('character varying', {
    nullable: false,
    length: 500,
    name: 'reason',
  })
  reason: string | null;

  @ManyToOne(() => BranchSortirLog, e => e.branchSortirLogDetail)
  @JoinColumn({ name: 'branch_sortir_log_id', referencedColumnName: 'branchSortirLogId' })
  branchSortirLog: BranchSortirLog;
}
