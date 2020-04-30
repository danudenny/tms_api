import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('sms_tracking_shift', { schema: 'public' })
export class SmsTrackingShift extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'sms_tracking_shift_id',
  })
  smsTrackingShiftId: string;

  @Column('character varying', {
    nullable: true,
    length: 100,
    name: 'work_from',
  })
  workFrom: string | null;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'work_to',
  })
  workTo: string | null;

  @Column('bigint', {
    nullable: false,
    name: 'user_id_created',
  })
  userIdCreated: number;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'created_time',
  })
  createdTime: Date;

  @Column('bigint', {
    nullable: false,
    name: 'user_id_updated',
  })
  userIdUpdated: number;

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
