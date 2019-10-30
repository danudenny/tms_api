import { Column, Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn, ManyToOne } from 'typeorm';

import { TmsBaseEntity } from './tms-base';
import { AwbItemAttr } from './awb-item-attr';
import { Awb } from './awb';
import { Bag } from './bag';
import { BagItem } from './bag-item';
import { BagItemAwb } from './bag-item-awb';

@Entity('pod_scan_in_branch_detail', { schema: 'public' })
export class PodScanInBranchDetail extends TmsBaseEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'pod_scan_in_branch_detail_id',
  })
  podScanInBranchDetailId: string;

  @Column('character varying', {
    nullable: false,
    name: 'pod_scan_in_branch_id',
  })
  podScanInBranchId: string;

  @Column('character varying', {
    nullable: false,
    name: 'bag_id',
  })
  bagId: number;

  @Column('bigint', {
    nullable: true,
    name: 'bag_item_id',
  })
  bagItemId: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'awb_id',
  })
  awbId: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'awb_item_id',
  })
  awbItemId: number | null;

  @OneToOne(() => AwbItemAttr)
  @JoinColumn({ name: 'awb_item_id', referencedColumnName: 'awbItemId' })
  awbItemAttr: AwbItemAttr;

  @OneToOne(() => BagItemAwb)
  @JoinColumn({ name: 'bag_item_id', referencedColumnName: 'bagItemId' })
  bagItemAwb: BagItemAwb;

  @OneToOne(() => Awb)
  @JoinColumn({ name: 'awb_id' })
  awb: Awb;

  @ManyToOne(() => Bag, bag => bag.podScanInBranchDetails, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'bag_id', referencedColumnName: 'bagId' })
  bag: Bag;

  @ManyToOne(() => BagItem, e => e.podScanInBranchDetails, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'bag_item_id', referencedColumnName: 'bagItemId' })
  bagItem: BagItem;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_trouble',
  })
  isTrouble: boolean;
}
