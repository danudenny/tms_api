import { Column, Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn, OneToMany, ManyToOne } from 'typeorm';
import { TmsBaseEntity } from './tms-base';
import { Branch } from './branch';
import { Customer } from './customer';
import { AwbStatus } from './awb-status';
import { DoReturnHistory } from './do_return_history';
import { DoReturnAdmintoCt } from './do_return_admin_to_ct';
import { DoReturnCtToCollection } from './do_return_ct_to_collection';
import { DoReturnCollectionToCust } from './do_return_collection_to_cust';

@Entity('do_return_awb', { schema: 'public' })
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

  @Column('uuid', {
    nullable: true,
    name: 'do_return_history_id_last',
  })
  doReturnHistoryIdLast: string | null;

  @Column('uuid', {
    nullable: true,
    name: 'do_return_admin_to_ct_id',
  })
  doReturnAdminToCtId: string | null;

  @Column('uuid', {
    nullable: true,
    name: 'do_return_ct_to_collection_id',
  })
  doReturnCtToCollectionId: string | null;

  @Column('uuid', {
    nullable: true,
    name: 'do_return_collection_to_cust_id',
  })
  doReturnCollectionToCustId: string | null;

  @Column('character varying', {
    nullable: true,
    name: 'do_return_awb_number',
  })
  doReturnAwbNumber: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'customer_id',
  })
  customerId: number | null;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'pod_datetime',
  })
  podDatetime: string;

  @OneToOne(() => Branch)
  @JoinColumn({ name: 'branch_id_last' })
  branchTo: Branch;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @ManyToOne(() => AwbStatus)
  @JoinColumn({ name: 'awb_status_id_last' })
  awbStatusDetail: AwbStatus;

  @OneToOne(() => DoReturnHistory)
  @JoinColumn({ name: 'do_return_history_id_last' })
  doReturnHistory: DoReturnHistory;

  @OneToOne(() => DoReturnAdmintoCt)
  @JoinColumn({ name: 'do_return_admin_to_ct_id' })
  doReturnAdmin: DoReturnAdmintoCt;

  @OneToOne(() => DoReturnCtToCollection)
  @JoinColumn({ name: 'do_return_ct_to_collection_id' })
  doReturnCt: DoReturnCtToCollection;

  @OneToOne(() => DoReturnCollectionToCust)
  @JoinColumn({ name: 'do_return_collection_to_cust_id' })
  doReturnCollection: DoReturnCollectionToCust;
}
