import { Column, Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';

import { TmsBaseEntity } from './tms-base';
import { CustomerAccount } from './customer-account';

@Entity('customer', { schema: 'public' })
export class Customer extends TmsBaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'customer_id',
  })
  customerId: number;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'customer_code',
  })
  customerCode: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'customer_name',
  })
  customerName: string;

  @Column('character varying', {
    nullable: true,
    length: 200,
    name: 'email1',
  })
  email1: string | null;

  @Column('character varying', {
    nullable: true,
    length: 200,
    name: 'email2',
  })
  email2: string | null;

  @OneToOne(() => CustomerAccount)
  @JoinColumn({ name: 'customer_id', referencedColumnName: 'customerId' })
  customerAccount: CustomerAccount;
}
