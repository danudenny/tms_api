import {Entity, PrimaryColumn} from "typeorm";
import {TmsBaseEntity} from './tms-base';

@Entity('do_sortation', {schema: 'public'})
export class DoSortation extends TmsBaseEntity {
    @PrimaryColumn({
        type: 'uuid',
        name: 'do_sortation_id',
    })
    doSortationId: string;
}