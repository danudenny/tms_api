import { BaseEntity, Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('awb_booking', { schema: 'public' })
@Index('awb_number_uniq', ['awb_number'], { unique: true })
@Index('awb_number_idx', ['awb_number'], { unique: true })
export class AwbBooking extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  awb_booking_id: string;

  @Column('bigint', {
    nullable: false,
  })
  customer_account_id: string;

  @Column('character varying', {
    nullable: false,
    unique: true,
    length: 255,
  })
  awb_number: string;

  @Column('bigint', {
    nullable: false,
    default: () => '1',
  })
  awb_booking_status_id: string;

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
