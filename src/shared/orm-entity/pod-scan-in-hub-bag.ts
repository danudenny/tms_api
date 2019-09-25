import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { TmsBaseEntity } from './tms-base';

@Entity('pod_scan_in_hub_bag', { schema: 'public' })
export class PodScanInHubBag extends TmsBaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'pod_scan_in_hub_bag_id',
  })
  podScanInHubBagId: number;

  @Column({
    type: 'bigint',
    name: 'pod_scan_in_hub_id',
  })
  podScanInHubId: number;

  @Column('bigint', {
    nullable: true,
    name: 'branch_id',
  })
  branchId: number | null;

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
