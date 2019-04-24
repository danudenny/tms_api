import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('awb_invalid', { schema: 'public' })
export class AwbInvalid extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  awb_invalid_id: string;

  @Column('timestamp without time zone', {
    nullable: true,
  })
  awb_date_time: Date | null;

  @Column('character varying', {
    nullable: true,
    length: 100,
  })
  ref_awb_number: string | null;

  @Column('character varying', {
    nullable: true,
    length: 500,
  })
  message_error: string | null;

  @Column('bigint', {
    nullable: true,
  })
  booking_customer_account_id: string | null;

  @Column('bigint', {
    nullable: true,
  })
  current_customer_account_id: string | null;

  @Column('json', {
    nullable: true,
  })
  request: Object | null;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
  })
  is_deleted: boolean;
}
