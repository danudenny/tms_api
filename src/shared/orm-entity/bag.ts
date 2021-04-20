import { Column, Entity, Index, PrimaryGeneratedColumn, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { BagItem } from './bag-item';
import { TmsBaseEntity } from './tms-base';
import { Representative } from './representative';
import { District } from './district';
import { PodScanInBranchBag } from './pod-scan-in-branch-bag';
import { PodScanInBranchDetail } from './pod-scan-in-branch-detail';
import { DropoffHub } from './dropoff_hub';
import { DropoffSortation } from './dropoff_sortation';
import { Branch } from './branch';
import { User } from './user';

@Entity('bag', { schema: 'public' })
@Index('bag_bag_date_idx', ['bagDate'])
@Index('bag_bag_number_idx', ['bagNumber'])
@Index('bag_branch_id_idx', ['branchId'])
@Index('bag_created_time_idx', ['createdTime'])
@Index('bag_is_deleted_idx', ['isDeleted'])
export class Bag extends TmsBaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'bag_id',
  })
  bagId: number;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'bag_number',
  })
  bagNumber: string;

  @Column('bigint', {
    nullable: true,
    name: 'representative_id_to',
  })
  representativeIdTo: number | null;

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

  @Column('bigint', {
    nullable: true,
    name: 'user_id',
  })
  userId: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'branch_id',
  })
  branchId: number | null;

  @Column('date', {
    nullable: true,
    name: 'bag_date',
  })
  bagDate: Date | null;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'bag_date_real',
  })
  bagDateReal: Date | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'ref_branch_code',
  })
  refBranchCode: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'ref_representative_code',
  })
  refRepresentativeCode: string | null;

// added by mohammad satria, 31 jul 2019
  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'bag_type',
  })
  bagType: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'district_id_to',
  })
  districtIdTo: number;

  @Column('bigint', {
    nullable: true,
    name: 'branch_id_to',
  })
  branchIdTo: number;

  @Column('boolean', {
    nullable: true,
    name: 'is_sortir',
  })
  isSortir: boolean;

  @Column('boolean', {
    nullable: true,
    name: 'is_manual',
  })
  isManual: boolean;

  @Column('character varying', {
    nullable: true,
    length: 50,
    name: 'seal_number',
  })
  sealNumber: string | null;

  // relation model
  @OneToMany(() => BagItem, e => e.bag, { cascade: ['insert'] })
  bagItems: BagItem[];

  @OneToMany(() => PodScanInBranchBag, e => e.bag, { cascade: ['insert'] })
  podScanInBranchBags: PodScanInBranchBag[];

  @OneToMany(() => PodScanInBranchDetail, e => e.bag, { cascade: ['insert'] })
  podScanInBranchDetails: PodScanInBranchDetail[];

  @OneToMany(() => DropoffHub, e => e.bag, { cascade: ['insert'] })
  dropoffHubs: DropoffHub[];

  @OneToMany(() => DropoffSortation, e => e.bag, { cascade: ['insert'] })
  dropoffSortations: DropoffSortation[];

  @OneToOne(() => Representative)
  @JoinColumn({ name: 'representative_id_to' })
  representative: Representative;

  @OneToOne(() => District)
  @JoinColumn({ name: 'district_id_to' })
  district: District;

  @OneToOne(() => Branch)
  @JoinColumn({ name: 'branch_id_to' })
  branchTo: Branch;

  @OneToOne(() => Branch)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id_updated' })
  user: User;
}
