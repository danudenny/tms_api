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
import { Todos } from './todos';

@Entity('items', { schema: 'public' })
@Index('index_items_on_todo_id', ['todo'])
export class Items extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  id: string;

  @Column('character varying', {
    nullable: true,

  })
  name: string | null;

  @Column('boolean', {
    nullable: true,

  })
  done: boolean | null;

  @ManyToOne(type => Todos, todos => todos.itemss, {})
  @JoinColumn({ name: 'todo_id' })
  todo: Todos | null;

  @Column('timestamp without time zone', {
    nullable: false,

  })
  created_at: Date;

  @Column('timestamp without time zone', {
    nullable: false,

  })
  updated_at: Date;
}
