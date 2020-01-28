import { Column, Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn, OneToMany, ManyToOne } from 'typeorm';
import { TmsBaseEntity } from './tms-base';
import { Branch } from './branch';
import { Customer } from './customer';
import { AwbStatus } from './awb-status';

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
  podDatetime: Date;

  @OneToOne(() => Branch)
  @JoinColumn({ name: 'branch_id_last' })
  branchTo: Branch;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @ManyToOne(() => AwbStatus)
  @JoinColumn({ name: 'awb_status_id_last' })
  awbStatusDetail: AwbStatus;
}
