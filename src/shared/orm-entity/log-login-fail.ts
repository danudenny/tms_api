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

@Entity('log_login_fail', { schema: 'public' })
export class LogLoginFail extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  log_login_fail_id: string;

  @Column('character varying', {
    nullable: false,
    length: 255,

  })
  username: string;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  password: string | null;

  @Column('character varying', {
    nullable: false,
    length: 500,

  })
  session_id: string;

  @Column('character varying', {
    nullable: true,
    length: 500,

  })
  error_message: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  remote_addr: string | null;

  @Column('character varying', {
    nullable: true,
    length: 500,

  })
  user_agent: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  platform_version: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  platform: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  browser_version: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  browser: string | null;

  @Column('timestamp without time zone', {
    nullable: true,

  })
  login_date: Date | null;

  @Column('timestamp without time zone', {
    nullable: true,

  })
  login_fail_date: Date | null;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',

  })
  is_deleted: boolean;
}
