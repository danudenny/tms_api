import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('customer_category', { schema: 'public' })
export class CustomerCategory extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  customer_category_id: string;

  @Column('bigint', {
    nullable: true,

  })
  customer_category_id_parent: string | null;

  @Column('integer', {
    nullable: false,

  })
  lft: number;

  @Column('integer', {
    nullable: false,

  })
  rgt: number;

  @Column('integer', {
    nullable: false,

  })
  depth: number;

  @Column('integer', {
    nullable: false,
    default: () => '1',

  })
  priority: number;

  @Column('character varying', {
    nullable: false,
    length: 255,

  })
  customer_category_code: string;

  @Column('character varying', {
    nullable: false,
    length: 255,

  })
  customer_category_name: string;

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
