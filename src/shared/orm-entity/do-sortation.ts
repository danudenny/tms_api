import {Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryColumn} from "typeorm";
import {TmsBaseEntity} from './tms-base';
import {DoSortationDetail} from "./do-sortation-detail";
import {Branch} from "./branch";

@Entity('do_sortation', {schema: 'public'})
export class DoSortation extends TmsBaseEntity {
    @PrimaryColumn({
        type: 'uuid',
        name: 'do_sortation_id',
    })
    doSortationId: string;

    @Column('character varying', {
        name: 'do_sortation_code',
        length: 25,
    })
    doSortationCode: string;

    @Column('integer', {
        name: 'do_sortation_status_id_last',
    })
    doSortationStatusIdLast: number;

    @Column({
        type: 'uuid',
        name: 'do_sortation_vehicle_id_last',
    })
    doSortationVehicleIdLast: string;

    @Column('character varying', {
        name: 'branch_id_to_list',
        array: true,
    })
    branchIdToList: string[];

    @Column('character varying', {
        name: 'branch_name_to_list',
        array: true,
    })
    branchNameToList: string[];

    @Column('integer', {
        name: 'branch_id_from',
    })
    branchIdFrom: number;

    @Column('integer', {
        name: 'trip',
    })
    trip: number;

    @Column('text', {
        name: 'note',
    })
    note: string;

    @Column('integer', {
        name: 'total_vehicle',
    })
    totalVehicle: number;

    @Column('integer', {
        name: 'total_do_sortation_detail',
    })
    totalDoSortationDetail: number;

    @Column('integer', {
        name: 'total_bag',
    })
    totalBag: number;

    @Column('integer', {
        name: 'total_bag_sortir',
    })
    totalBagSortir: number;

    @Column('timestamp without time zone', {
        nullable: false,
        name: 'do_sortation_time',
    })
    doSortationTime: Date;

    @Column('timestamp without time zone', {
        nullable: false,
        name: 'departure_date_time',
    })
    depatureDateTime: Date;

    @Column('timestamp without time zone', {
        nullable: false,
        name: 'arrival_date_time',
    })
    arrivalDateTime: Date;

    @OneToMany(() => DoSortationDetail, detail => detail.doSortationId)
    doSortationDetails: DoSortationDetail[];

    @OneToOne(() => Branch)
    @JoinColumn({ name: 'branch_id_from' })
    branchFrom: Branch;

}