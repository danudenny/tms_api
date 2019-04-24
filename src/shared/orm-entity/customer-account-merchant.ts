import { BaseEntity, Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('customer_account_merchant', { schema: 'public' })
@Index(
  'customer_account_merchant_customer_account_merchant_code_key',
  ['customer_account_merchant_code'],
  { unique: true },
)
export class CustomerAccountMerchant extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  customer_account_merchant_id: string;

  @Column('character varying', {
    nullable: true,
    unique: true,
    length: 255,

  })
  customer_account_merchant_code: string | null;

  @Column('bigint', {
    nullable: false,

  })
  customer_account_id_parent: string;

  @Column('bigint', {
    nullable: false,

  })
  customer_account_id_child: string;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',

  })
  is_cashless: boolean;

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
