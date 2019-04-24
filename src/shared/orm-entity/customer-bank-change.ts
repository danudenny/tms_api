import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('customer_bank_change', { schema: 'public' })
export class CustomerBankChange extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  customer_bank_change_id: string;

  @Column('bigint', {
    nullable: true,

  })
  customer_account_change_id: string | null;

  @Column('bigint', {
    nullable: true,

  })
  bank_branch_id: string | null;

  @Column('character varying', {
    nullable: false,
    length: 200,

  })
  account_number: string;

  @Column('character varying', {
    nullable: false,
    length: 200,

  })
  account_name: string;

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
