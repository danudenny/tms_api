import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { DoSmdVehicle } from './do_smd_vehicle';
import { Employee } from './employee';
import { TmsBaseEntity } from './tms-base';
import { User } from './user';
@Entity('history_module_finish', { schema: 'public' })
export class HistoryModuleFinish extends TmsBaseEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'history_module_finish_id',
  })
  historyModuleFinishId: string;

  @Column('character varying', {
    nullable: false,
    name: 'do_smd_code',
  })
  doSmdCode: string;

  @Column('integer', {
    nullable: false,
    name: 'vehicle_id',
  })
  vehicleId: number;

  @Column('integer', {
    nullable: false,
    name: 'driver_id',
  })
  driverId: number;

  @Column('integer', {
    nullable: false,
    name: 'branch_id',
  })
  branchId: number;

  @OneToOne(() => Employee)
  @JoinColumn({ name: 'driver_id', referencedColumnName: 'employeeId' })
  employee: Employee;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id_updated' })
  admin: User;
}
