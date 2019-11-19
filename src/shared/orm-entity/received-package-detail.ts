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

@Entity('received_package_detail', { schema: 'public' })
export class ReceivedPackageDetail extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  received_package_detail_id: string;

  @Column('bigint', {
    nullable: false,

  })
  received_package_id: string;

  @Column('character varying', {
    nullable: false,
    length: 100,

  })
  awb_number: string;

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
