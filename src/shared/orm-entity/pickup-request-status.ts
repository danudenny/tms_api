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

@Entity('pickup_request_status', { schema: 'public' })
export class PickupRequestStatus extends BaseEntity {
  @Column('bigint', {
    nullable: false,
    primary: true,

  })
  pickup_request_status_id: string;

  @Column('character varying', {
    nullable: true,
    length: 100,

  })
  status_code: string | null;

  @Column('character varying', {
    nullable: true,
    length: 100,

  })
  status_title: string | null;

  @Column('character varying', {
    nullable: true,
    length: 100,

  })
  status_name: string | null;

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
