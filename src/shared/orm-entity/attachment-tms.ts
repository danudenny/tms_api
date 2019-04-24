import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('attachment_tms', { schema: 'public' })
export class AttachmentTms extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  attachment_tms_id: string;

  @Column('character varying', {
    nullable: true,
    length: 500,
  })
  url: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
  })
  attachment_path: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
  })
  attachment_name: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
  })
  filename: string | null;

  @Column('text', {
    nullable: true,
  })
  description: string | null;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
  })
  is_used: boolean;

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
