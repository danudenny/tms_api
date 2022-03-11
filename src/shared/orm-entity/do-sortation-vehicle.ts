import {Column, Entity, JoinColumn, OneToOne, PrimaryColumn} from 'typeorm';
import { Employee } from './employee';
import {TmsBaseEntity} from './tms-base';

@Entity('do_sortation_vehicle', {schema: 'public'})
export class DoSortationVehicle extends TmsBaseEntity {
    @PrimaryColumn({
        type: 'uuid',
        name: 'do_sortation_vehicle_id',
    })
    doSortationVehicleId: string;

    @Column({
        type: 'uuid',
        name: 'do_sortation_id',
    })
    doSortationId: string;

    @Column('integer', {
        name: 'vehicle_id',
    })
    vehicleId: number;

    @Column('character varying', {
        name: 'vehicle_number',
    })
    vehicleNumber: string;

    @Column('integer', {
        name: 'vehicle_seq',
    })
    vehicleSeq: number;

    @Column('integer', {
        name: 'employee_driver_id',
    })
    employeeDriverId: number;

    @Column('integer', {
        name: 'branch_id_created',
    })
    branchIdCreated: number;

    @Column('text', {
        name: 'note',
    })
    note: string;

    @OneToOne(() => Employee)
    @JoinColumn({ name: 'employee_driver_id' })
    employee: Employee;
}
