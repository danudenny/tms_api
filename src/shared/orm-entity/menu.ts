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

@Entity('menu', { schema: 'public' })
export class Menu extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  menu_id: string;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  menu_code: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  menu_name: string | null;

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

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  directory: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  controller: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  method: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  label: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  icon: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  link: string | null;

  @Column('bigint', {
    nullable: true,

  })
  menu_id_parent: string | null;

  @Column('integer', {
    nullable: true,

  })
  lft: number | null;

  @Column('integer', {
    nullable: true,

  })
  rgt: number | null;

  @Column('integer', {
    nullable: true,

  })
  depth: number | null;

  @Column('integer', {
    nullable: true,

  })
  priority: number | null;
}
