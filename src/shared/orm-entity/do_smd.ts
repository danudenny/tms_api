import { Column, Entity, Index, PrimaryGeneratedColumn, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { TmsBaseEntity } from './tms-base';
import { Representative } from './representative';
import { Branch } from './branch';
import { DoSmdDetail } from './do_smd_detail';

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

  @OneToOne(() => Branch)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @OneToOne(() => DoSmdDetail)
  @JoinColumn({ name: 'do_smd_id' })
  doSmdDetail: DoSmdDetail;
}
