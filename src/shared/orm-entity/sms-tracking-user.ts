import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('sms_tracking_user', { schema: 'public' })
export class SmsTrackingUser extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'sms_tracking_user_id',
  })
  smsTrackingUserId: number;

  @Column('character varying', {
    nullable: true,
    length: 100,
    name: 'name',
  })
  name: string | null;

  @Column('character varying', {
    nullable: true,
    length: 100,
    name: 'phone',
  })
  phone: string | null;

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
