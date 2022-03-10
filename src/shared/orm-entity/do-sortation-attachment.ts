import {Column, Entity, PrimaryColumn} from "typeorm";
import {TmsBaseEntity} from './tms-base';

@Entity('do_sortation_attachment', {schema: 'public'})
export class DoSortationAttachment extends TmsBaseEntity {
    @PrimaryColumn({
        type: 'uuid',
        name: 'do_sortation_attachment_id',
    })
    doSortationAttachmentId: string;

    @Column('integer', {
        name: 'attachment_tms_id',
    })
    attachmentTmsId: number;

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

    @Column('character varying', {
        name: 'attachment_type',
    })
    attachmentType: string;
}