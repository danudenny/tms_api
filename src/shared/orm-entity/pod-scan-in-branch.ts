import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { TmsBaseEntity } from './tms-base';
import { PodScanInBranchBag } from './pod-scan-in-branch-bag';
import { PodScanInBranchDetail } from './pod-scan-in-branch-detail';
import { BagItem } from './bag-item';
import { Branch } from './branch';

@Entity('pod_scan_in_branch', { schema: 'public' })
export class PodScanInBranch extends TmsBaseEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'pod_scan_in_branch_id',
  })
  podScanInBranchId: string;

  @Column('bigint', {
    nullable: false,
    name: 'branch_id',
  })
  branchId: number;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'scan_in_type',
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

  @ManyToOne(() => PodScanInBranchBag)
  @JoinColumn({ name: 'pod_scan_in_branch_id', referencedColumnName: 'podScanInBranchId' })
  podScanInBranchBag: PodScanInBranchBag;

  @ManyToOne(() => PodScanInBranchDetail)
  @JoinColumn({ name: 'pod_scan_in_branch_id', referencedColumnName: 'podScanInBranchId' })
  PodScanInBranchDetail: PodScanInBranchDetail;

  @ManyToOne(() => BagItem)
  @JoinColumn({ name: 'bag_item_id', referencedColumnName: 'bagItemId' })
  bagItem: BagItem;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branch_id', referencedColumnName: 'branchId' })
  branch: Branch;

}
