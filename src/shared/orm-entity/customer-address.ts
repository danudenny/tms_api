import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('customer_address', { schema: 'public' })
export class CustomerAddress extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  customer_address_id: string;

  @Column('bigint', {
    nullable: true,

  })
  customer_account_id: string | null;

  @Column('bigint', {
    nullable: true,

  })
  district_id: string | null;

  @Column('text', {
    nullable: false,

  })
  address: string;

  @Column('character varying', {
    nullable: false,
    length: 20,
    default: () => '0',

  })
  zip_code: string;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',

  })
  is_pickup: boolean;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',

  })
  is_billing: boolean;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',

  })
  is_cust_address: boolean;

  @Column('bigint', {
    nullable: false,

  })
  user_id_created: string;

  @Column('timestamp without time zone', {
    nullable: false,

  })
  created_time: Date;

  @Column('bigint', {
    nullable: false,

  })
  user_id_updated: string;

  @Column('timestamp without time zone', {
    nullable: false,

  })
  updated_time: Date;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',

  })
  is_deleted: boolean;
}
