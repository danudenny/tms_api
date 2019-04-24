import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('email_log_history', { schema: 'public' })
export class EmailLogHistory extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'email_log_history_id',
  })
  emailLogHistoryId: string;

  @Column('bigint', {
    nullable: false,
    name: 'email_log_id',
  })
  emailLogId: string;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'ref_table',
  })
  refTable: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'ref_id',
  })
  refId: string | null;

  @Column('text', {
    nullable: true,
    name: 'email_subject',
  })
  emailSubject: string | null;

  @Column('text', {
    nullable: true,
    name: 'email_to',
  })
  emailTo: string | null;

  @Column('text', {
    nullable: true,
    name: 'email_cc',
  })
  emailCc: string | null;

  @Column('text', {
    nullable: true,
    name: 'email_bcc',
  })
  emailBcc: string | null;

  @Column('text', {
    nullable: true,
    name: 'html_body',
  })
  htmlBody: string | null;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'email_sent',
  })
  emailSent: boolean;

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
