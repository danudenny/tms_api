import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { TmsBaseEntity } from './tms-base';

@Entity('pod_scan_in_branch_bag', { schema: 'public' })
export class PodScanInBranchBag extends TmsBaseEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'pod_scan_in_branch_bag_id',
  })
  podScanInBranchBagId: string;

  @Column('character varying', {
    name: 'pod_scan_in_branch_id',
  })
  podScanInBranchId: string;

  @Column('bigint', {
    nullable: false,
    name: 'bag_id',
  })
  bagId: number;

  @Column('bigint', {
    nullable: true,
    name: 'bag_item_id',
  })
  bagItemId: number | null;

  @Column('integer', {
    nullable: false,
    default: () => 0,
    name: 'total_awb_item',
  })
  totalAwbItem: number | null;

  @Column('integer', {
    nullable: false,
    default: () => 0,
    name: 'total_awb_scan',
  })
  totalAwbScan: number | null;

  @Column('integer', {
    nullable: false,
    default: () => 0,
    name: 'total_diff',
  })
  totalDiff: number | null;

  @Column('character varying', {
    nullable: true,
    name: 'notes',
  })
  notes: string | null;

}
