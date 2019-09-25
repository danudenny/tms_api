import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { TmsBaseEntity } from './tms-base';

@Entity('pod_scan_in_branch', { schema: 'public' })
export class PodScanInBranch extends TmsBaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'pod_scan_in_branch_id',
  })
  podScanInBranchId: number;

  @Column('bigint', {
    nullable: false,
    name: 'branch_id',
  })
  branchId: number;

  @Column('character varying', {
    nullable: false,
    length: 255,
  })
  scanInType: string;

  @Column('bigint', {
    nullable: false,
    name: 'transaction_status_id',
  })
  transactionStatusId: number;

  @Column('integer', {
    nullable: false,
    default: () => 0,
    name: 'total_bag_scan',
  })
  totalBagScan: number | null;

}
