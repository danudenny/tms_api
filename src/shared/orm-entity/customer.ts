import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { TmsBaseEntity } from './tms-base';

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

  @Column('boolean', {
    nullable: true,
    default: () => 'false',
    name: 'is_deleted',
  })
  isDeleted: boolean;

  @Column('character varying', {
    nullable: true,
    length: 200,
    name: 'email2',
  })
  email2: string | null;
}
