import {Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryColumn} from "typeorm";
import {TmsBaseEntity} from './tms-base';
import {DoSortationDetailItem} from "./do-sortation-detail-item";
import {Branch} from "./branch";
import {DoSortation} from "./do-sortation";

@Entity('do_sortation_detail', {schema: 'public'})
export class DoSortationDetail extends TmsBaseEntity {
    @PrimaryColumn({
        type: 'uuid',
        name: 'do_sortation_detail_id',
    })
    doSortationDetailId: string;

    @Column({
        type: 'uuid',
        name: 'do_sortation_id',
    })
    doSortationId: string;

    @Column({
        type: 'uuid',
        name: 'do_sortation_vehicle_id',
    })
    doSortationVehicleId: string;

    @Column('integer', {
        name: 'do_sortation_status_id_last',
    })
    doSortationStatusIdLast: number;

    @Column('timestamp without time zone', {
        nullable: false,
        name: 'do_sortation_time',
    })
    doSortationTime: Date;

    @Column('integer', {
        name: 'branch_id_from',
    })
    branchIdFrom: number;

    @Column('integer', {
        name: 'branch_id_to',
    })
    branchIdTo: number;

    @Column('integer', {
        name: 'total_bag',
    })
    totalBag: number;

    @Column('integer', {
        name: 'total_bag_sortir',
    })
    totalBagSortir: number;

    @Column('boolean', {
        nullable: false,
        default: () => 'false',
        name: 'is_sortir',
    })
    isSortir: boolean;

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

    @Column('integer', {
        name: 'check_point',
    })
    checkPoint: number;

    @Column('character varying', {
        name: 'longitude_departure',
    })
    longitudeDeparture: string;

    @Column('character varying', {
        name: 'longitude_arrival',
    })
    longitudeArrival: string;

    @Column('character varying', {
        name: 'latitude_departure',
    })
    latitudeDeparture: string;

    @Column('character varying', {
        name: 'latitude_arrival',
    })
    latitudeArrival: string;

    @OneToMany(() => DoSortationDetailItem, item => item.doSortationDetailId)
    doSortationDetailItems: DoSortationDetailItem[];

    @OneToOne(() => Branch)
    @JoinColumn({ name: 'branch_id_from' })
    branchFrom: Branch;

    @OneToOne(() => Branch)
    @JoinColumn({ name: 'branch_id_to' })
    branchTo: Branch;

    @ManyToOne(() => DoSortation, sortation => sortation.doSortationId)
    doSortation: DoSortation;
}