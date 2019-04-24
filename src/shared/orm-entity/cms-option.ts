import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('cms_option', { schema: 'public' })
export class CmsOption extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  cms_option_id: string;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  cms_option_name: string | null;

  @Column('text', {
    nullable: true,

  })
  cms_option_value: string | null;

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
