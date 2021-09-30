import { Column, Entity, Index, PrimaryGeneratedColumn, OneToMany, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { TmsBaseEntity } from './tms-base';
import { Representative } from './representative';
import { Branch } from './branch';
import { DoSmdDetail } from './do_smd_detail';
import { DoSmdVehicle } from './do_smd_vehicle';
import { Vendor } from './vendor';
import { User } from './user';

@Entity('do_smd', { schema: 'public' })
// @Index('bag_bag_date_idx', ['bagDate'])
// @Index('bag_bag_number_idx', ['bagNumber'])
// @Index('bag_branch_id_idx', ['branchId'])
// @Index('bag_created_time_idx', ['createdTime'])
// @Index('bag_is_deleted_idx', ['isDeleted'])
export class DoSmd extends TmsBaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'do_smd_id',
  })
  doSmdId: number;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'do_smd_code',
  })
  doSmdCode: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'do_smd_note',
  })
  doSmdNote: string;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'do_smd_time',
  })
  doSmdTime: Date;

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
    name: 'do_smd_detail_id_last',
  })
  doSmdDetailIdLast: number | null;

  @Column('bigint', {
    nullable: false,
    default: () => 0,
    name: 'total_detail',
  })
  totalDetail: number;

  @Column('bigint', {
    nullable: false,
    default: () => 0,
    name: 'total_item',
  })
  totalItem: number;

  @Column('bigint', {
    nullable: false,
    default: () => 0,
    name: 'total_vehicle',
  })
  totalVehicle: number;

  @Column('bigint', {
    nullable: true,
    // name: 'do_smd_vehicle_id_last',
    name: 'vehicle_id_last',
  })
  doSmdVehicleIdLast: number | null;

  @Column('boolean', {
    nullable: true,
    default: () => 'false',
    name: 'is_empty',
  })
  isEmpty: boolean;

  @Column('bigint', {
    nullable: false,
    default: () => 1000,
    name: 'do_smd_status_id_last',
  })
  doSmdStatusIdLast: number;

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
    nullable: false,
    default: () => 0,
    name: 'total_bagging',
  })
  totalBagging: number;

  @Column('bigint', {
    nullable: false,
    default: () => 0,
    name: 'total_bag',
  })
  totalBag: number;

  @Column('bigint', {
    nullable: false,
    default: () => 0,
    name: 'total_bag_representative',
  })
  totalBagRepresentative: number;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'branch_to_name_list',
  })
  branchToNameList: string;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'departure_schedule_date_time',
  })
  departureScheduleDateTime: Date;

  @Column('bigint', {
    nullable: true,
    name: 'trip',
  })
  trip: number | null;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'departure_date_time',
  })
  departureDateTime: Date | null;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'transit_date_time',
  })
  transitDateTime: Date | null;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'arrival_date_time',
  })
  arrivalDateTime: Date | null;

  @Column('bigint', {
    nullable: true,
    name: 'counter_trip',
  })
  counterTrip: number | null;

  @Column('character varying', {
    nullable: true,
    length: 50,
    name: 'seal_number_last',
  })
  sealNumberLast: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'vendor_id',
  })
  vendorId: number| null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'vendor_name',
  })
  vendorName: string | null;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_vendor',
  })
  isVendor: boolean;

  @Column('bigint', {
    nullable: false,
    default: () => 0,
    name: 'is_intercity',
  })
  isIntercity: number;

  @OneToOne(() => Branch)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;
  userUpdatedName;
  @OneToMany(() => DoSmdDetail, e => e.doSmd)
  doSmdDetails: DoSmdDetail[];

  @OneToOne(() => DoSmdVehicle)
  @JoinColumn({ name: 'vehicle_id_last', referencedColumnName: 'doSmdVehicleId' })
  doSmdVehicle: DoSmdVehicle;

  @ManyToOne(() => Vendor)
  @JoinColumn({ name: 'vendor_id', referencedColumnName: 'vendorId' })
  vendor: Vendor;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id_updated' })
  admin: User;
}
