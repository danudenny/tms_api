import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';

@Entity('user_notification_msg', { schema: 'public' })
export class UserNotificationMsg extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  user_notification_msg_id: string;

  @Column('bigint', {
    nullable: false,

  })
  notification_msg_id: string;

  @Column('bigint', {
    nullable: false,

  })
  user_id: string;

  @Column('bigint', {
    nullable: false,

  })
  branch_id: string;

  @Column('jsonb', {
    nullable: false,

  })
  notification_token_id_ref: Object;

  @Column('jsonb', {
    nullable: true,

  })
  response_token: Object | null;

  @Column('integer', {
    nullable: false,
    default: () => '0',

  })
  is_notif_sent: number;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',

  })
  is_open: boolean;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',

  })
  is_read: boolean;

  @Column('timestamp without time zone', {
    nullable: true,

  })
  last_seen: Date | null;

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
