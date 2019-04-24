import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('customer_meta_change', { schema: 'public' })
export class CustomerMetaChange extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  customer_meta_change_id: string;

  @Column('bigint', {
    nullable: true,

  })
  customer_account_change_id: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  meta_key: string | null;

  @Column('text', {
    nullable: true,

  })
  meta_value: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  meta_type: string | null;

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
