import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import {AwbStatus} from './awb-status';
import {SmsTrackingUser} from './sms-tracking-user';

@Entity('sms_tracking_message', { schema: 'public' })
export class SmsTrackingMessage extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'sms_tracking_message_id',
  })
  smsTrackingMessageId: number;

  @Column('bigint', {
    nullable: true,
    name: 'sent_to',
  })
  sentTo: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'awb_status_id',
  })
  awbStatusId: number | null;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_repeated',
  })
  isRepeated: boolean;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_repeated_over',
  })
  isRepeatedOver: boolean;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'note',
  })
  note: string | null;

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

  @OneToOne(() => AwbStatus)
  @JoinColumn({ name: 'awb_status_id', referencedColumnName: 'awbStatusId' })
  awbStatus: AwbStatus;

  @OneToOne(() => SmsTrackingUser)
  @JoinColumn({ name: 'sent_to', referencedColumnName: 'smsTrackingUserId' })
  smsTrackingUser: SmsTrackingUser;
}
