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

@Entity('do_smu_detail', { schema: 'public' })
export class DoSmuDetail extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  do_smu_detail_id: string;

  @Column('bigint', {
    nullable: false,

  })
  do_smu_id: string;

  @Column('bigint', {
    nullable: false,

  })
  smu_id: string;

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

  @Column('text', {
    nullable: true,

  })
  note: string | null;

  @Column('jsonb', {
    nullable: true,

  })
  attachment_tms_id_smu_pic: Object | null;

  @Column('bigint', {
    nullable: false,
    default: () => '0',

  })
  smu_item_id: string;
}
