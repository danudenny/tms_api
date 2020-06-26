import { Column, Entity, Index, PrimaryGeneratedColumn, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { TmsBaseEntity } from './tms-base';
import { Representative } from './representative';
import { Branch } from './branch';
import { DoSmdDetail } from './do_smd_detail';
import { DoSmd } from './do_smd';
import { DoSmdStatus } from './do_smd_status';
import { DoSmdVehicle } from './do_smd_vehicle';
import { User } from './user';
import { Reason } from './reason';

@Entity('do_smd_history', { schema: 'public' })
// @Index('bag_bag_date_idx', ['bagDate'])
// @Index('bag_bag_number_idx', ['bagNumber'])
// @Index('bag_branch_id_idx', ['branchId'])
// @Index('bag_created_time_idx', ['createdTime'])
// @Index('bag_is_deleted_idx', ['isDeleted'])
export class DoSmdHistory extends TmsBaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'do_smd_history_id',
  })
  doSmdHistoryId: number;

  @Column('bigint', {
    nullable: false,
    name: 'do_smd_id',
  })
  doSmdId: number;

  @Column('bigint', {
    nullable: true,
    name: 'do_smd_detail_id',
  })
  doSmdDetailId: number | null;

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

  @Column('character varying', {
    nullable: true,
    length: 500,
    name: 'latitude',
  })
  latitude: string | null;

  @Column('character varying', {
    nullable: true,
    length: 500,
    name: 'longitude',
  })
  longitude: string | null;

  @Column('bigint', {
    nullable: false,
    default: () => 1000,
    name: 'do_smd_status_id',
  })
  doSmdStatusId: number;

  @Column('bigint', {
    nullable: true,
    name: 'do_smd_vehicle_id',
  })
  doSmdVehicleId: number | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'seal_number',
  })
  sealNumber: string | null;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'departure_schedule_date_time',
  })
  departureScheduleDateTime: Date;

  @Column('bigint', {
    nullable: false,
    name: 'reason_id',
  })
  reasonId: number;

  @Column('character varying', {
    nullable: true,
    length: 500,
    name: 'reason_notes',
  })
  reasonNotes: string | null;

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
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @OneToOne(() => DoSmd)
  @JoinColumn({ name: 'do_smd_id' })
  doSmd: DoSmd;

  @OneToOne(() => DoSmdDetail)
  @JoinColumn({ name: 'do_smd_detail_id' })
  doSmdDetail: DoSmdDetail;

  @OneToOne(() => DoSmdStatus)
  @JoinColumn({ name: 'do_smd_status_id' })
  doSmdStatus: DoSmdStatus;

  @OneToOne(() => DoSmdVehicle)
  @JoinColumn({ name: 'do_smd_vehicle_id' })
  doSmdVehicle: DoSmdVehicle;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id_created' })
  user: User;

  @OneToOne(() => Reason)
  @JoinColumn({ name: 'reason_id' })
  reason: Reason;

}
