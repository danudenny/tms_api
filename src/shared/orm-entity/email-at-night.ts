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

@Entity('email_at_night', { schema: 'public' })
@Index('ean_awb_date_idx', ['awb_date'])
@Index('ean_updated_time_idx', ['updated_time'])
export class EmailAtNight extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  email_at_night_id: string;

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
}
