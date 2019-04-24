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

@Entity('pickup_request_invalid', { schema: 'public' })
@Index('pickup_request_invalid_created_time', ['created_time'])
@Index('pickup_request_invalid_ref_awb_number', ['ref_awb_number'])
export class PickupRequestInvalid extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  pickup_request_invalid_id: string;

  @Column('timestamp without time zone', {
    nullable: true,

  })
  pickup_request_date_time: Date | null;

  @Column('character varying', {
    nullable: true,
    length: 100,

  })
  ref_awb_number: string | null;

  @Column('character varying', {
    nullable: true,
    length: 500,

  })
  message_error: string | null;

  @Column('json', {
    nullable: true,

  })
  request: Object | null;

  @Column('bigint', {
    nullable: true,

  })
  partner_id: string | null;

  @Column('bigint', {
    nullable: false,

  })
  user_id_created: string;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  user_created: string | null;

  @Column('timestamp without time zone', {
    nullable: false,

  })
  created_time: Date;

  @Column('bigint', {
    nullable: false,

  })
  user_id_updated: string;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  user_updated: string | null;

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
