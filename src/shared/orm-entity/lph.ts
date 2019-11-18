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

@Entity('lph', { schema: 'public' })
@Index('lph_awb_date_idx', ['awb_date'])
export class Lph extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  lph_id: string;

  @Column('timestamp without time zone', {
    nullable: false,

  })
  awb_date: Date;

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
    nullable: false,
    default: () => 'false',

  })
  is_jne: boolean;
}
