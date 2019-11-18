import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('customer_setting', { schema: 'public' })
export class CustomerSetting extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'customer_setting_id',
  })
  customerSettingId: string;

  @Column('bigint', {
    nullable: false,
    name: 'customer_account_id',
  })
  customerAccountId: string;

  @Column('character varying', {
    nullable: true,
    length: 10,
    name: 'billing_print_type',
  })
  billingPrintType: string | null;

  @Column('boolean', {
    nullable: true,
    name: 'end_of_month',
  })
  endOfMonth: boolean | null;

  @Column('integer', {
    nullable: false,
    default: () => '7',
    name: 'reminder_reconcile',
  })
  reminderReconcile: number;

  @Column('boolean', {
    nullable: true,
    name: 'send_email',
  })
  sendEmail: boolean | null;

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
