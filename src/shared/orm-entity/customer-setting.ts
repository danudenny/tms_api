import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('customer_setting', { schema: 'public' })
export class CustomerSetting extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  customer_setting_id: string;

  @Column('bigint', {
    nullable: false,

  })
  customer_account_id: string;

  @Column('character varying', {
    nullable: true,
    length: 10,

  })
  billing_print_type: string | null;

  @Column('boolean', {
    nullable: true,

  })
  end_of_month: boolean | null;

  @Column('integer', {
    nullable: false,
    default: () => '7',

  })
  reminder_reconcile: number;

  @Column('boolean', {
    nullable: true,

  })
  send_email: boolean | null;

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
