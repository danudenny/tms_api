import { BaseEntity, Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('customer_meta', { schema: 'public' })
@Index('index_meta_key', ['meta_key'])
export class CustomerMeta extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  customer_meta_id: string;

  @Column('bigint', {
    nullable: true,

  })
  customer_account_id: string | null;

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
