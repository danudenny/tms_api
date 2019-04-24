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

@Entity('notification_token', { schema: 'public' })
export class NotificationToken extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  notification_token_id: string;

  @Column('bigint', {
    nullable: true,

  })
  user_id: string | null;

  @Column('character varying', {
    nullable: false,
    length: 600,

  })
  token: string;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  imei: string | null;

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

  @Column('bigint', {
    nullable: true,

  })
  branch_id: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  ip_address_v4: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  ip_address_v6: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  device_version: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  device_name: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  device_os: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  mac_address_eth0: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  mac_address_wlan0: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  apps_version: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  apps_version_release: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  connectivity_status: string | null;
}
