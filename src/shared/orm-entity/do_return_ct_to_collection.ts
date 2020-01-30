import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TmsBaseEntity } from './tms-base';

@Entity('do_return_ct_to_collection', { schema: 'public' })
export class DoReturnCtToCollection extends TmsBaseEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'do_return_ct_to_collection_id',
  })
  doReturnCtToCollectionId: string;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'do_return_ct_to_collection',
  })
  doReturnCtToCollection: string;

  @Column('bigint', {
    nullable: true,
    name: 'count_awb',
  })
  countAwb: number;

}
