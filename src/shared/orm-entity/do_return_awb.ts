import { Column, Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn, OneToMany, ManyToOne } from 'typeorm';
import { TmsBaseEntity } from './tms-base';
import { Branch } from './branch';
import { Customer } from './customer';
import { AwbStatus } from './awb-status';
import { DoReturnHistory } from './do_return_history';
import { DoReturnAdmintoCt } from './do_return_admin_to_ct';
import { DoReturnCtToCollection } from './do_return_ct_to_collection';
import { DoReturnCollectionToCust } from './do_return_collection_to_cust';
import { CustomerAddress } from './customer-address';
import { CustomerAccount } from './customer-account';
import { User } from './user';
import { AwbItemAttr } from './awb-item-attr';
import { TrackingNote } from './tracking_note';
import { Awb } from './awb';

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

  @Column('bigint', {
    nullable: true,
    name: 'customer_address_id',
  })
  customerAddressId: number | null;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'pod_datetime',
  })
  podDatetime: string;

  @Column('bigint', {
    nullable: true,
    name: 'user_id_driver',
  })
  userIdDriver: number | null;

  @OneToOne(() => Branch)
  @JoinColumn({ name: 'branch_id_last' })
  branchTo: Branch;

  @OneToOne(() => AwbItemAttr)
  @JoinColumn({ name: 'awb_number', referencedColumnName: 'awbNumber' })
  awbLast: AwbItemAttr;

  @OneToOne(() => Awb)
  @JoinColumn({ name: 'awb_number', referencedColumnName: 'awbNumber' })
  awb: Awb;

  // @OneToMany(() => TrackingNote, x => x.doReturnAwb)
  // @JoinColumn({ name: 'receiptnumber', referencedColumnName: 'receiptnumber' })
  // trackingNote: TrackingNote[];

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @ManyToOne(() => CustomerAccount)
  @JoinColumn({ name: 'customer_id', referencedColumnName: 'customerId' })
  customerAccount: CustomerAccount;

  @ManyToOne(() => CustomerAddress)
  @JoinColumn({ name: 'customer_address_id' })
  customerAddress: CustomerAddress;

  @ManyToOne(() => AwbStatus)
  @JoinColumn({ name: 'awb_status_id_last' })
  awbStatusDetail: AwbStatus;

  @ManyToOne(() => DoReturnAdmintoCt)
  @JoinColumn({ name: 'do_return_admin_to_ct_id' })
  doReturnAdmin: DoReturnAdmintoCt;

  @ManyToOne(() => DoReturnHistory)
  @JoinColumn({ name: 'do_return_history_id_last' })
  doReturnHistory: DoReturnHistory;

  @ManyToOne(() => DoReturnCtToCollection)
  @JoinColumn({ name: 'do_return_ct_to_collection_id' })
  doReturnCt: DoReturnCtToCollection;

  @ManyToOne(() => DoReturnCollectionToCust)
  @JoinColumn({ name: 'do_return_collection_to_cust_id' })
  doReturnCollection: DoReturnCollectionToCust;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id_driver' })
  user: User;
}
