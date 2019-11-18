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

@Entity('notification_msg', { schema: 'public' })
export class NotificationMsg extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  notification_msg_id: string;

  @Column('character varying', {
    nullable: true,
    length: 500,

  })
  title: string | null;

  @Column('text', {
    nullable: true,

  })
  message: string | null;

  @Column('bigint', {
    nullable: true,

  })
  attachment_id: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  module: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  ref_table: string | null;

  @Column('bigint', {
    nullable: true,

  })
  ref_id: string | null;

  @Column('text', {
    nullable: true,

  })
  response_message: string | null;

  @Column('character varying', {
    nullable: true,
    length: 500,

  })
  multicast_id: string | null;

  @Column('text', {
    nullable: true,

  })
  success: string | null;

  @Column('text', {
    nullable: true,

  })
  failure: string | null;

  @Column('character varying', {
    nullable: true,
    length: 500,

  })
  canonical_ids: string | null;

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

  @Column('json', {
    nullable: true,

  })
  options: Object | null;
}
