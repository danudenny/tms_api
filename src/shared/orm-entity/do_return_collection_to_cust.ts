import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { DoReturnAwb } from './do_return_awb';
import { TmsBaseEntity } from './tms-base';
import { User } from './user';
import { Branch } from './branch';
import { Customer } from './customer';
import { CustomerAccount } from './customer-account';

@Entity('do_return_collection_to_cust', { schema: 'public' })
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
    name: 'count_awb',
  })
  countAwb: number;

  @Column('bigint', {
    nullable: true,
    name: 'branch_id',
  })
  branchId: number;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_receipt_cust',
  })
  isReceiptCust: boolean;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'notes',
  })
  notes: string;

  @Column('bigint', {
    nullable: true,
    name: 'customer_id',
  })
  customerId: number;

  @Column('bigint', {
    nullable: true,
    name: 'customer_account_id',
  })
  customerAccountId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id_created' })
  user: User;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @OneToMany(() => DoReturnAwb, e => e.doReturnCollection)
  doReturnAwbs: DoReturnAwb[];

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @ManyToOne(() => CustomerAccount)
  @JoinColumn({ name: 'customer_account_id' , referencedColumnName: 'customerAccountId' })
  customerAccount: CustomerAccount;
}