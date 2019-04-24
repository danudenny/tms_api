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

@Entity('sys_counter', { schema: 'public' })
@Index('sys_counter_key_key', ['key'], { unique: true })
export class SysCounter extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  sys_counter_id: string;

  @Column('character varying', {
    nullable: false,
    unique: true,
    length: 20,

  })
  key: string;

  @Column('bigint', {
    nullable: false,
    default: () => '1',

  })
  counter: string;

  @Column('timestamp without time zone', {
    nullable: false,

  })
  created_time: Date;

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
