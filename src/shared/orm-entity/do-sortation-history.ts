import {Column, Entity, JoinColumn, OneToOne, PrimaryColumn} from "typeorm";
import {TmsBaseEntity} from './tms-base';
import {Branch} from "./branch";
import {DoSortationStatus} from "./do-sortation-status";

@Entity('do_sortation_history', {schema: 'public'})
export class DoSortationHistory extends TmsBaseEntity {
    @PrimaryColumn({
        type: 'uuid',
        name: 'do_sortation_history_id',
    })
    doSortationHistoryId: string;

    @Column({
        type: 'uuid',
        name: 'do_sortation_id',
    })
    doSortationId: string;

    @Column({
        type: 'uuid',
        name: 'do_sortation_detail_id',
    })
    doSortationDetailId: string;

    @Column({
        type: 'uuid',
        name: 'do_sortation_vehicle_id',
    })
    doSortationVehicleId: string;

    @Column('timestamp without time zone', {
        nullable: false,
        name: 'do_sortation_time',
    })
    doSortationTime: Date;

    @Column('integer', {
        name: 'do_sortation_status_id',
    })
    doSortationStatusId: number;

    @Column('integer', {
        name: 'branch_id_from',
    })
    branchIdFrom: number;

    @Column('integer', {
        name: 'branch_id_to',
    })
    branchIdTo: number;

    @Column('integer', {
        name: 'reason_id',
    })
    reasonId: number;

    @Column('text', {
        name: 'reason_note',
    })
    reasonNote: string;

    @OneToOne(() => DoSortationStatus)
    @JoinColumn({ name: 'do_sortation_status_id' })
    doSortationStatus: DoSortationStatus;
}