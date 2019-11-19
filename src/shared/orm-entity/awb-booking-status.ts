import { BaseEntity, Column, Entity } from 'typeorm';

@Entity('awb_booking_status', { schema: 'public' })
export class AwbBookingStatus extends BaseEntity {
  @Column('integer', {
    nullable: false,
    primary: true,
    name: 'awb_booking_status_id',
  })
  awbBookingStatusId: number;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'awb_booking_status_name',
  })
  awbBookingStatusName: string;

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
