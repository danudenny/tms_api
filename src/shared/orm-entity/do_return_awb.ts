import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TmsBaseEntity } from './tms-base';

@Entity('do_return_awb ', { schema: 'public' })
export class DoReturnAwb extends TmsBaseEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'do_return_awb_id',
  })
  doReturnAwbId: string;

  @Column('bigint', {
    nullable: true,
    name: 'branch_id_last',
  })
  branchIdLast: number | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'awb_number',
  })
  awbNumber: string;

  @Column('bigint', {
    nullable: true,
    name: 'awb_status_id_last',
  })
  awbStatusIdLast: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'do_return_id_history_last',
  })
  doReturnIdHistoryLast: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'do_return_admin_to_ct_id',
  })
  doReturnAdminToCtId: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'do_return_ct_to_collection_id',
  })
  doReturnCtToCollectionId: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'do_return_collection_to_cust_id',
  })
  doReturnCollectionToCustId: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'customer_id',
  })
  customerId: number | null;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'pod_datetime',
  })
  podDatetime: Date;

}
