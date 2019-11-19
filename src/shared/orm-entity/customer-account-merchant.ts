import { BaseEntity, Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('customer_account_merchant', { schema: 'public' })
@Index(
  'customer_account_merchant_customer_account_merchant_code_key',
  ['customerAccountMerchantCode'],
  { unique: true },
)
export class CustomerAccountMerchant extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'customer_account_merchant_id',
  })
  customerAccountMerchantId: string;

  @Column('character varying', {
    nullable: true,
    unique: true,
    length: 255,
    name: 'customer_account_merchant_code',
  })
  customerAccountMerchantCode: string | null;

  @Column('bigint', {
    nullable: false,
    name: 'customer_account_id_parent',
  })
  customerAccountIdParent: string;

  @Column('bigint', {
    nullable: false,
    name: 'customer_account_id_child',
  })
  customerAccountIdChild: string;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_cashless',
  })
  isCashless: boolean;

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
