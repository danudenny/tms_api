import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Employee } from './employee';
import { TmsBaseEntity } from './tms-base';

@Entity('do_sortation_vehicle', { schema: 'public' })
export class DoSortationVehicle extends TmsBaseEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'do_sortation_vehicle_id',
  })
  doSortationVehicleId: string;

  @Column('character varying', {
    nullable: false,
    name: 'do_sortation_id',
  })
  doSortationId: string;

  @Column('integer', {
    nullable: true,
    name: 'vehicle_id',
  })
  vehicleId: number;

  @Column('character varying', {
    nullable: false,
    name: 'vehicle_number',
  })
  vehicleNumber: string;

  @Column('integer', {
    nullable: false,
    name: 'vehicle_seq',
    default: () => 0,
  })
  vehicleSeq: number;

  @Column('integer', {
    nullable: false,
    name: 'employee_driver_id',
  })
  employeeDriverId: number;

  @Column('integer', {
    nullable: false,
    name: 'branch_id_created',
  })
  branchIdCreated: number;

  @Column('text', {
    name: 'note',
  })
  note: string;

  @Column('boolean', {
    default: true,
    name: 'is_active'
  })
  isActive: boolean;

  @Column('bigint', {
    nullable: false,
    name: 'user_id_created',
  })
  userIdCreated: number;

  @Column('bigint', {
    nullable: false,
    name: 'user_id_updated',
  })
  userIdUpdated: number;

  @Column('boolean', {
    default: () => 'false',
    name: 'is_deleted',
  })
  isDeleted: boolean;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'created_time',
  })
  createdTime: Date;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'updated_time',
  })
  updatedTime: Date;

  @OneToOne(() => Employee)
  @JoinColumn({ name: 'employee_driver_id' })
  employee: Employee;
}
