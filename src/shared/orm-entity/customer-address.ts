import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('customer_address', { schema: 'public' })
export class CustomerAddress extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'customer_address_id',
  })
  customerAddressId: string;

  @Column('bigint', {
    nullable: true,
    name: 'customer_account_id',
  })
  customerAccountId: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'district_id',
  })
  districtId: string | null;

  @Column('text', {
    nullable: false,
    name: 'address',
  })
  address: string;

  @Column('character varying', {
    nullable: false,
    length: 20,
    default: () => '0',
    name: 'zip_code',
  })
  zipCode: string;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_pickup',
  })
  isPickup: boolean;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_billing',
  })
  isBilling: boolean;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_cust_address',
  })
  isCustAddress: boolean;

  @Column('bigint', {
    nullable: false,
    name: 'user_id_created',
  })
  userIdCreated: string;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'created_time',
  })
  createdTime: Date;

  @Column('bigint', {
    nullable: false,
    name: 'user_id_updated',
  })
  userIdUpdated: string;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'updated_time',
  })
  updatedTime: Date;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_deleted',
  })
  isDeleted: boolean;
}
