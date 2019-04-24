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

@Entity('reason', { schema: 'public' })
export class Reason extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  reason_id: string;

  @Column('character varying', {
    nullable: false,
    length: 255,

  })
  apps_code: string;

  @Column('character varying', {
    nullable: false,
    length: 255,

  })
  reason_category: string;

  @Column('character varying', {
    nullable: false,
    length: 255,

  })
  reason_type: string;

  @Column('character varying', {
    nullable: false,
    length: 255,

  })
  reason_code: string;

  @Column('character varying', {
    nullable: true,
    length: 500,

  })
  reason_name: string | null;

  @Column('text', {
    nullable: true,

  })
  reason_description: string | null;

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

  @Column('boolean', {
    nullable: true,
    default: () => 'true',

  })
  is_reschedule_pickup: boolean | null;

  @Column('boolean', {
    nullable: true,
    default: () => 'true',

  })
  is_reschedule: boolean | null;
}
