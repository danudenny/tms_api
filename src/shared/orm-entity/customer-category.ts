import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('customer_category', { schema: 'public' })
export class CustomerCategory extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'customer_category_id',
  })
  customerCategoryId: string;

  @Column('bigint', {
    nullable: true,
    name: 'customer_category_id_parent',
  })
  customerCategoryIdParent: string | null;

  @Column('integer', {
    nullable: false,
    name: 'lft',
  })
  lft: number;

  @Column('integer', {
    nullable: false,
    name: 'rgt',
  })
  rgt: number;

  @Column('integer', {
    nullable: false,
    name: 'depth',
  })
  depth: number;

  @Column('integer', {
    nullable: false,
    default: () => '1',
    name: 'priority',
  })
  priority: number;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'customer_category_code',
  })
  customerCategoryCode: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'customer_category_name',
  })
  customerCategoryName: string;

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
