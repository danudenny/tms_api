import { Column, Entity, PrimaryColumn } from 'typeorm';
import { TmsBaseEntity } from './tms-base';

@Entity('do_sortation_status', { schema: 'public' })
export class DoSortationStatus extends TmsBaseEntity {
  @PrimaryColumn({
    type: 'integer',
    name: 'do_sortation_status_id',
  })
  doSortationStatusId: number;

  @Column('character varying', {
    name: 'do_sortation_status_name',
  })
  doSortationStatusName: string;

  @Column('character varying', {
    name: 'do_sortation_status_title',
  })
  doSortationStatusTitle: string;

  @Column('character varying', {
    name: 'do_sortation_status_desc',
  })
  doSortationStatusDesc: string;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_public',
  })
  isPublic: boolean;
}
