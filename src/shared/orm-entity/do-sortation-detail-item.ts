import {Column, Entity, ManyToOne, PrimaryColumn} from "typeorm";
import {TmsBaseEntity} from './tms-base';
import {DoSortationDetail} from "./do-sortation-detail";

@Entity('do_sortation_detail_item', {schema: 'public'})
export class DoSortationDetailItem extends TmsBaseEntity {
    @PrimaryColumn({
        type: 'uuid',
        name: 'do_sortation_detail_item_id',
    })
    doSortationDetailItemId: string;

    @Column({
        type: 'uuid',
        name: 'do_sortation_detail_id',
    })
    doSortationDetailId: string;

    @Column('integer', {
        name: 'bag_item_id',
    })
    bagItemId: number;

    @Column('boolean', {
        nullable: false,
        default: () => 'false',
        name: 'is_sortir',
    })
    isSortir: boolean;

    @ManyToOne(() => DoSortationDetail, detail => detail.doSortationDetailId)
    doSortationDetail: DoSortationDetail;

}