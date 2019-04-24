import { BaseEntity, Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Todos } from './todos';

@Entity('items', { schema: 'public' })
@Index('index_items_on_todo_id', ['todo'])
export class Items extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'id',
  })
  id: string;

  @Column('character varying', {
    nullable: true,
    name: 'name',
  })
  name: string | null;

  @Column('boolean', {
    nullable: true,
    name: 'done',
  })
  done: boolean | null;

  @ManyToOne(type => Todos, todos => todos.itemss, {})
  @JoinColumn({ name: 'todo_id' })
  todo: Todos | null;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'created_at',
  })
  createdAt: Date;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'updated_at',
  })
  updatedAt: Date;
}
