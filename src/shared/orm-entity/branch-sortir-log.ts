import { Column, Entity, PrimaryGeneratedColumn, JoinColumn, OneToMany } from 'typeorm';

import { TmsBaseEntity } from './tms-base';
import { BranchSortirLogDetail } from './branch-sortir-log-detail';

@Entity('branch_sortir_log', { schema: 'public' })
export class BranchSortirLog extends TmsBaseEntity {
  @PrimaryGeneratedColumn({
    type: 'uuid',
    name: 'branch_sortir_log_id',
  })
  branchSortirLogId: string;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'scan_date',
  })
  scanDate: Date;

  @Column('integer', {
    nullable: false,
    name: 'qty_succeed',
  })
  qtySucceed: number;

  @Column('integer', {
    nullable: false,
    name: 'qty_fail',
  })
  qtyFail: number;

  @Column('integer', {
    nullable: false,
    name: 'branch_id',
  })
  branchId: number;

  @OneToMany(() => BranchSortirLogDetail, e => e.branchSortirLog)
  @JoinColumn({ name: 'branch_sortir_log_id', referencedColumnName: 'branchSortirLogId' })
  branchSortirLogDetail: BranchSortirLogDetail[];
}
