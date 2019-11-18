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

@Entity('user_api', { schema: 'public' })
export class UserApi extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  id: string;

  @Column('character varying', {
    nullable: true,

  })
  name: string | null;

  @Column('character varying', {
    nullable: true,

  })
  email: string | null;

  @Column('character varying', {
    nullable: true,

  })
  password_digest: string | null;

  @Column('boolean', {
    nullable: true,
    default: () => 'false',

  })
  is_deleted: boolean | null;

  @Column('timestamp without time zone', {
    nullable: true,

  })
  created_time: Date | null;

  @Column('timestamp without time zone', {
    nullable: true,

  })
  updated_time: Date | null;

  @Column('bigint', {
    nullable: true,

  })
  client_id: string | null;
}
