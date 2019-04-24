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
import { Items } from './items';

@Entity('todos', { schema: 'public' })
export class Todos extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  id: string;

  @Column('character varying', {
    nullable: true,

  })
  title: string | null;

  @Column('character varying', {
    nullable: true,

  })
  created_by: string | null;

  @Column('timestamp without time zone', {
    nullable: false,

  })
  created_at: Date;

  @Column('timestamp without time zone', {
    nullable: false,

  })
  updated_at: Date;

  @OneToMany(type => Items, items => items.todo)
  itemss: Items[];
}
