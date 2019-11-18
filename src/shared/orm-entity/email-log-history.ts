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

@Entity('email_log_history', { schema: 'public' })
export class EmailLogHistory extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  email_log_history_id: string;

  @Column('bigint', {
    nullable: false,

  })
  email_log_id: string;

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
  email_subject: string | null;

  @Column('text', {
    nullable: true,

  })
  email_to: string | null;

  @Column('text', {
    nullable: true,

  })
  email_cc: string | null;

  @Column('text', {
    nullable: true,

  })
  email_bcc: string | null;

  @Column('text', {
    nullable: true,

  })
  html_body: string | null;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',

  })
  email_sent: boolean;

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
