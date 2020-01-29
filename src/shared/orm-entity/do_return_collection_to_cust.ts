import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TmsBaseEntity } from './tms-base';

@Entity('do_return_collection_to_cust ', { schema: 'public' })
export class DoReturnCollectionToCust extends TmsBaseEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'do_return_collection_to_cust_id',
  })
  doReturnCollectionToCustId: string;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'do_return_collection_to_cust',
  })
  doReturnCollectionToCust: string;

  @Column('bigint', {
    nullable: true,
    name: 'count_awb_do_return_collection_to_cust',
  })
  countAwb: number;

  @Column('bigint', {
    nullable: true,
    name: 'attachment_id',
  })
  attachmentId: string;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'awb_number_new',
  })
  awbNumberNew: string;
}
