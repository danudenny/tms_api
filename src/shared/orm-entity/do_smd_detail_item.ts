import { Column, Entity, Index, PrimaryGeneratedColumn, OneToMany, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
// import { BagItem } from './bag-item';
import { TmsBaseEntity } from './tms-base';
import { Representative } from './representative';
// import { District } from './district';
// import { PodScanInBranchBag } from './pod-scan-in-branch-bag';
// import { PodScanInBranchDetail } from './pod-scan-in-branch-detail';
// import { DropoffHub } from './dropoff_hub';
// import { DropoffSortation } from './dropoff_sortation';
import { Branch } from './branch';
import { User } from './user';
import { DoSmdDetail } from './do_smd_detail';
import { BagItem } from './bag-item';
import { Bagging } from './bagging';

@Entity('do_smd_detail_item', { schema: 'public' })
// @Index('bag_bag_date_idx', ['bagDate'])
// @Index('bag_bag_number_idx', ['bagNumber'])
// @Index('bag_branch_id_idx', ['branchId'])
// @Index('bag_created_time_idx', ['createdTime'])
// @Index('bag_is_deleted_idx', ['isDeleted'])
export class DoSmdDetailItem extends TmsBaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'do_smd_detail_item_id',
  })
  doSmdDetailItemId: number;

  @Column('bigint', {
    nullable: false,
    name: 'do_smd_detail_id',
  })
  doSmdDetailId: number;

  @Column('bigint', {
    nullable: false,
    name: 'user_id_scan',
  })
  userIdScan: number;

  @Column('bigint', {
    nullable: false,
    name: 'branch_id_scan',
  })
  branchIdScan: number;

  @Column('bigint', {
    nullable: true,
    name: 'bag_item_id',
  })
  bagItemId: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'bag_id',
  })
  bagId: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'bagging_id',
  })
  baggingId: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'bag_representative_id',
  })
  bagRepresentativeId: number | null;

  @Column('bigint', {
    nullable: true,
    default: () => 0,
    name: 'bag_type',
  })
  bagType: number;

  @Column('bigint', {
    nullable: false,
    name: 'user_id_created',
  })
  userIdCreated: number;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'created_time',
  })
  createdTime: Date;

  @Column('bigint', {
    nullable: false,
    name: 'user_id_updated',
  })
  userIdUpdated: number;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'updated_time',
  })
  updatedTime: Date;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_deleted',
  })
  isDeleted: boolean;

  @OneToOne(() => Branch)
  @JoinColumn({ name: 'branch_id_scan' })
  branch: Branch;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id_scan' })
  user: User;

  @ManyToOne(() => DoSmdDetail, e => e.doSmdDetailItems)
  @JoinColumn({ name: 'do_smd_detail_id', referencedColumnName: 'doSmdDetailId' })
  doSmdDetail: DoSmdDetail;

  @OneToOne(() => BagItem)
  @JoinColumn({ name: 'bag_item_id' })
  bagItem: BagItem;

  @ManyToOne(() => Bagging, e => e.doSmdDetailItem)
  @JoinColumn({ name: 'bagging_id', referencedColumnName: 'baggingId' })
  bagging: Bagging;
}
