import { BaseEntity, Column, Entity } from 'typeorm';

@Entity('awb_booking_status', { schema: 'public' })
export class AwbBookingStatus extends BaseEntity {
  @Column('integer', {
    nullable: false,
    primary: true,
  })
  awb_booking_status_id: number;

  @Column('character varying', {
    nullable: false,
    length: 255,
  })
  awb_booking_status_name: string;

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
