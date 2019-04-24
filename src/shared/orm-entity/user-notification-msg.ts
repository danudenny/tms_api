import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('user_notification_msg', { schema: 'public' })
export class UserNotificationMsg extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'user_notification_msg_id',
  })
  userNotificationMsgId: string;

  @Column('bigint', {
    nullable: false,
    name: 'notification_msg_id',
  })
  notificationMsgId: string;

  @Column('bigint', {
    nullable: false,
    name: 'user_id',
  })
  userId: string;

  @Column('bigint', {
    nullable: false,
    name: 'branch_id',
  })
  branchId: string;

  @Column('jsonb', {
    nullable: false,
    name: 'notification_token_id_ref',
  })
  notificationTokenIdRef: Object;

  @Column('jsonb', {
    nullable: true,
    name: 'response_token',
  })
  responseToken: Object | null;

  @Column('integer', {
    nullable: false,
    default: () => '0',
    name: 'is_notif_sent',
  })
  isNotifSent: number;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_open',
  })
  isOpen: boolean;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_read',
  })
  isRead: boolean;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'last_seen',
  })
  lastSeen: Date | null;

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
