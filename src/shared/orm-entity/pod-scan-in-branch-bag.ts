import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { TmsBaseEntity } from './tms-base';
import { Bag } from './bag';
import { BagItem } from './bag-item';
import { Branch } from './branch';

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
    name: 'branch_id',
  })
  branchId: number;

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

  // new field
  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'bag_number',
  })
  bagNumber: string;

  @ManyToOne(() => Bag, bag => bag.podScanInBranchBags, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'bag_id', referencedColumnName: 'bagId' })
  bag: Bag;

  @ManyToOne(() => BagItem, e => e.podScanInBranchBag, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'bag_item_id', referencedColumnName: 'bagItemId' })
  bagItem: BagItem;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branch_id', referencedColumnName: 'branchId' })
  branch: Branch;

}
