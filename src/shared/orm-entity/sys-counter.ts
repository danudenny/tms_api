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
    name:'sys_counter_id',
  })
  sysCounterId: string;

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
    name:'created_time',
  })
  createdTime: Date;

  @Column('timestamp without time zone', {
    nullable: false,
    name:'updated_time',
  })
  updatedTime: Date;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name:'is_deleted',
  })
  isDeleted: boolean;
}
