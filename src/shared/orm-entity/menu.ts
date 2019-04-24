import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('menu', { schema: 'public' })
export class Menu extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'menu_id',
  })
  menuId: string;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'menu_code',
  })
  menuCode: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'menu_name',
  })
  menuName: string | null;

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

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'directory',
  })
  directory: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'controller',
  })
  controller: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'method',
  })
  method: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'label',
  })
  label: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'icon',
  })
  icon: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'link',
  })
  link: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'menu_id_parent',
  })
  menuIdParent: string | null;

  @Column('integer', {
    nullable: true,
    name: 'lft',
  })
  lft: number | null;

  @Column('integer', {
    nullable: true,
    name: 'rgt',
  })
  rgt: number | null;

  @Column('integer', {
    nullable: true,
    name: 'depth',
  })
  depth: number | null;

  @Column('integer', {
    nullable: true,
    name: 'priority',
  })
  priority: number | null;
}
