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

@Entity('representative', { schema: 'public' })
export class Representative extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  representative_id: string;

  @Column('character varying', {
    nullable: false,
    length: 255,

  })
  representative_code: string;

  @Column('character varying', {
    nullable: false,
    length: 255,

  })
  representative_name: string;

  @Column('character varying', {
    nullable: true,
    length: 500,

  })
  email: string | null;

  @Column('bigint', {
    nullable: true,

  })
  branch_id: string | null;

  @Column('numeric', {
    nullable: false,
    default: () => '0',
    precision: 10,
    scale: 5,

  })
  min_weight: string;

  @Column('numeric', {
    nullable: false,
    default: () => '0',
    precision: 10,
    scale: 5,

  })
  price_per_kg: string;

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

  @Column('bigint', {
    nullable: true,

  })
  representative_id_parent: string | null;
}
