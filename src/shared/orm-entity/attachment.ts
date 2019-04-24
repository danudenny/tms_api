import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('attachment', { schema: 'public' })
export class Attachment extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'attachment_id',
  })
  attachmentId: string;

  @Column('character varying', {
    nullable: true,
    length: 500,
    name: 'url',
  })
  url: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'attachment_path',
  })
  attachmentPath: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'attachment_name',
  })
  attachmentName: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'filename',
  })
  filename: string | null;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_used',
  })
  isUsed: boolean;

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
