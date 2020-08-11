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
import {DoSmd} from './do_smd';
import { DoSmdDetailItem } from './do_smd_detail_item';

@Entity('do_smd_detail', { schema: 'public' })
// @Index('bag_bag_date_idx', ['bagDate'])
// @Index('bag_bag_number_idx', ['bagNumber'])
// @Index('bag_branch_id_idx', ['branchId'])
// @Index('bag_created_time_idx', ['createdTime'])
// @Index('bag_is_deleted_idx', ['isDeleted'])
export class DoSmdDetail extends TmsBaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'do_smd_detail_id',
  })
  doSmdDetailId: number;

  @Column('bigint', {
    nullable: false,
    name: 'do_smd_id',
  })
  doSmdId: number;

  @Column('bigint', {
    nullable: false,
    name: 'user_id',
  })
  userId: number;

  @Column('bigint', {
    nullable: false,
    name: 'branch_id',
  })
  branchId: number;

  @Column('bigint', {
    nullable: true,
    name: 'do_smd_vehicle_id',
  })
  doSmdVehicleId: number | null;

  @Column('bigint', {
    nullable: false,
    name: 'branch_id_from',
  })
  branchIdFrom: number;

  @Column('bigint', {
    nullable: false,
    name: 'branch_id_to',
  })
  branchIdTo: number;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'representative_code_list',
  })
  representativeCodeList: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'seal_number',
  })
  sealNumber: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'scanned_seal_number',
  })
  scannedSealNumber: string;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'departure_schedule_date_time',
  })
  departureScheduleDateTime: Date;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'departure_time',
  })
  departureTime: Date;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'arrival_time',
  })
  arrivalTime: Date;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'received_time',
  })
  receivedTime: Date;

  @Column('bigint', {
    nullable: true,
    name: 'do_smd_status_id_last',
    default: () => 1000,
  })
  doSmdStatusIdLast: number | null;

  @Column('bigint', {
    nullable: false,
    default: () => 0,
    name: 'total_bag',
  })
  totalBag: number;

  @Column('bigint', {
    nullable: false,
    default: () => 0,
    name: 'total_bagging',
  })
  totalBagging: number;

  @Column('bigint', {
    nullable: false,
    default: () => 0,
    name: 'total_bag_representative',
  })
  totalBagRepresentative: number;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'latitude_departure',
  })
  latitudeDeparture: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'longitude_departure',
  })
  longitudeDeparture: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'latitude_arrival',
  })
  latitudeArrival: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'longitude_arrival',
  })
  longitudeArrival: string;

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
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @OneToOne(() => Branch)
  @JoinColumn({ name: 'branch_id_to' })
  branchTo: Branch;

  @ManyToOne(() => DoSmd, e => e.doSmdDetails)
  @JoinColumn({ name: 'do_smd_id', referencedColumnName: 'doSmdId' })
  doSmd: DoSmd;

  @OneToMany(() => DoSmdDetailItem, e => e.doSmdDetail)
  doSmdDetailItems: DoSmdDetailItem[];
}
