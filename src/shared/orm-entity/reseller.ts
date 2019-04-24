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

@Entity('reseller', { schema: 'public' })
export class Reseller extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  reseller_id: string;

  @Column('bigint', {
    nullable: false,

  })
  branch_id: string;

  @Column('bigint', {
    nullable: false,

  })
  district_id: string;

  @Column('character varying', {
    nullable: false,
    length: 255,

  })
  reseller_code: string;

  @Column('character varying', {
    nullable: false,
    length: 255,

  })
  reseller_name: string;

  @Column('text', {
    nullable: false,

  })
  address: string;

  @Column('character varying', {
    nullable: true,
    length: 20,

  })
  phone1: string | null;

  @Column('character varying', {
    nullable: true,
    length: 20,

  })
  phone2: string | null;

  @Column('character varying', {
    nullable: true,
    length: 20,

  })
  mobile1: string | null;

  @Column('character varying', {
    nullable: true,
    length: 20,

  })
  mobile2: string | null;

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
