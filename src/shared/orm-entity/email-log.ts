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

@Entity('email_log', { schema: 'public' })
export class EmailLog extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  email_log_id: string;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  email_type: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  ref_id: string | null;

  @Column('text', {
    nullable: true,

  })
  options: string | null;

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
