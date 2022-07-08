import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { DoSmdVehicle } from './do_smd_vehicle';
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
  vechileId: number;

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

  @OneToOne(() => DoSmdVehicle)
  @JoinColumn({ name: 'vehicle_id', referencedColumnName: 'doSmdVehicleId' })
  doSmdVehicle: DoSmdVehicle;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id_updated' })
  admin: User;
}
