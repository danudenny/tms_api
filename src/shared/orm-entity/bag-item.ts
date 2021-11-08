import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Bag } from './bag';
import { BagItemAwb } from './bag-item-awb';
import { BagItemHistory } from './bag-item-history';
import { Branch } from './branch';
import { Employee } from './employee';
import { TmsBaseEntity } from './tms-base';
import { PodScanInBranchBag } from './pod-scan-in-branch-bag';
import { PodScanInBranchDetail } from './pod-scan-in-branch-detail';
import { DropoffHub } from './dropoff_hub';
import { DropoffSortation } from './dropoff_sortation';

@Entity('bag_item', { schema: 'public' })
@Index('bag_item_bag_id_idx', ['bagId'])
@Index('bag_item_bag_seq_idx', ['bagSeq'])
@Index('bag_item_is_deleted_idx', ['isDeleted'])
export class BagItem extends TmsBaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'bag_item_id',
  })
  bagItemId: number;

  @Column('bigint', {
    nullable: false,
    name: 'bag_id',
  })
  bagId: number;

  @Column('numeric', {
    nullable: true,
    precision: 10,
    scale: 5,
  })
  weight: number | null;

  @Column('integer', {
    nullable: false,
    name: 'bag_seq',
  })
  bagSeq: number;

  @Column('integer', {
    nullable: false,
    name: 'bag_item_status_id_last',
  })
  bagItemStatusIdLast: number;

  @Column('integer', {
    nullable: false,
    name: 'branch_id_last',
  })
  branchIdLast: number;

  @Column('integer', {
    nullable: false,
    name: 'branch_id_next',
  })
  branchIdNext: number;

  @Column('bigint', {
    nullable: true,
    name: 'bag_item_history_id',
  })
  bagItemHistoryId: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'bagging_id_last',
  })
  baggingIdLast: number | null;

  @Column('boolean', {
    nullable: true,
    name: 'is_sortir',
  })
  isSortir: boolean;

  @Column('bigint', {
    nullable: true,
    name: 'user_id_updated',
  })
  userIdUpdated: number | null;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'updated_time',
  })
  updatedTime: Date;
  // @Column('integer', {
  //   nullable: true,
  //   name: 'employee_id_last',
  // })
  // employeeIdLast: number;

  // @ManyToOne(() => Employee)
  // @JoinColumn({ name: 'employee_id_last' })
  // employee: Employee;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branch_id_next' })
  branchNext: Branch;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branch_id_last' })
  branchLast: Branch;

  @ManyToOne(() => Bag, bag => bag.bagItems, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'bag_id', referencedColumnName: 'bagId' })
  bag: Bag;

  @OneToMany(() => BagItemAwb, bagItemAwb => bagItemAwb.bagItem)
  bagItemAwbs: BagItemAwb[];

  @OneToMany(() => PodScanInBranchBag, e => e.bagItem, { cascade: ['insert'] })
  podScanInBranchBag: PodScanInBranchBag[];

  @OneToMany(() => PodScanInBranchDetail, e => e.bagItem, { cascade: ['insert'] })
  podScanInBranchDetails: PodScanInBranchDetail[];

  @OneToMany(() => DropoffHub, e => e.bagItem, { cascade: ['insert'] })
  dropoffHub: DropoffHub[];

  @OneToMany(() => DropoffSortation, e => e.bagItem, { cascade: ['insert'] })
  dropoffSortation: DropoffSortation[];

  @OneToMany(() => BagItemHistory, bagItemHistory => bagItemHistory.bagItemId)
  bagItemHistorys: BagItemHistory[];
}
