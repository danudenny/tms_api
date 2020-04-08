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

@Entity('partner', { schema: 'public' })
export class Partner extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  partner_id: string;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  partner_name: string | null;

  @Column('character varying', {
    nullable: true,
    length: 500,

  })
  partner_email: string | null;

  @Column('character varying', {
    nullable: true,
    length: 500,

  })
  api_key: string | null;

  @Column('bigint', {
    nullable: true,

  })
  customer_account_id: string | null;

  @Column('bigint', {
    nullable: true,

  })
  awb_number_start: string | null;

  @Column('bigint', {
    nullable: true,

  })
  awb_number_end: string | null;

  @Column('bigint', {
    nullable: true,

  })
  current_awb_number: string | null;

  @Column('integer', {
    nullable: true,

  })
  sla_hour_pickup: number | null;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',

  })
  is_active: boolean;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',

  })
  is_email_log: boolean;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',

  })
  is_assign_to_branch: boolean;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',

  })
  is_assign_to_courier: boolean;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',

  })
  is_pick_unpick: boolean;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',

  })
  is_reschedule: boolean;

  @Column('character varying', {
    nullable: true,
    length: 20,

  })
  sm_code: string | null;

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
    name: 'is_deleted',
  })
  isDeleted: boolean;

  @Column('json', {
    nullable: true,

  })
  validation: Object | null;
}
