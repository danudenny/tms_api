import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('sms_tracking_message', { schema: 'public' })
export class SmsTrackingMessage extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'sms_tracking_message_id',
  })
  smsTrackingMessageId: string;

  @Column('character varying', {
    nullable: true,
    length: 100,
    name: 'sent_to',
  })
  sentTo: string | null;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_repeated',
  })
  isRepeated: boolean;

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
}
