import { Column, Entity, Index, PrimaryGeneratedColumn, OneToMany, OneToOne, JoinColumn } from 'typeorm';
// import { BagItem } from './bag-item';
import { TmsBaseEntity } from './tms-base';
import { Representative } from './representative';
// import { District } from './district';
// import { PodScanInBranchBag } from './pod-scan-in-branch-bag';
// import { PodScanInBranchDetail } from './pod-scan-in-branch-detail';
// import { DropoffHub } from './dropoff_hub';
// import { DropoffSortation } from './dropoff_sortation';
import { Branch } from './branch';
import { Employee } from './employee';
import { DoSmdVehicleAttachment } from './do_smd_vehicle_attachment';

@Entity('do_smd_vehicle', { schema: 'public' })
// @Index('bag_bag_date_idx', ['bagDate'])
// @Index('bag_bag_number_idx', ['bagNumber'])
// @Index('bag_branch_id_idx', ['branchId'])
// @Index('bag_created_time_idx', ['createdTime'])
// @Index('bag_is_deleted_idx', ['isDeleted'])
export class DoSmdVehicle extends TmsBaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'do_smd_vehicle_id',
  })
  doSmdVehicleId: number;

  @Column('bigint', {
    nullable: false,
    name: 'do_smd_id',
  })
  doSmdId: number;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'vehicle_number',
  })
  vehicleNumber: string;

  @Column('bigint', {
    nullable: false,
    name: 'employee_id_driver',
  })
  employeeIdDriver: number;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_active',
  })
  isActive: boolean;

  @Column('bigint', {
    nullable: true,
    name: 'branch_id_start',
  })
  branchIdStart: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'branch_id_end',
  })
  branchIdEnd: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'reason_id',
  })
  reasonId: number | null;

  @Column('character varying', {
    nullable: true,
    length: 500,
    name: 'notes',
  })
  notes: string | null;

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

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'reason_date',
  })
  reasonDate: Date | null;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'handover_date',
  })
  handOverDate: Date | null;

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
  @JoinColumn({ name: 'branch_id_start' })
  branchStart: Branch;

  @OneToOne(() => Branch)
  @JoinColumn({ name: 'branch_id_end' })
  branchEnd: Branch;

  @OneToOne(() => Employee)
  @JoinColumn({ name: 'employee_id_driver' })
  employee: Branch;

  // @OneToMany(() => DoSmdVehicleAttachment, doSmdVehicleAttachment => doSmdVehicleAttachment.doSmdVehicleId)
  // doSmdVehicleAttachments: DoSmdVehicleAttachment[];
}
