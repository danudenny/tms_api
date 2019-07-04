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

@Entity('reason', { schema: 'public' })
export class Reason extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'reason_id',
  })
  reasonId: number;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'apps_code',
  })
  appsCode: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'reason_category',
  })
  reasonCategory: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'reason_type',
  })
  reasonType: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'reason_code',
  })
  reasonCode: string;

  @Column('character varying', {
    nullable: true,
    length: 500,
    name: 'reason_name',
  })
  reasonName: string | null;

  @Column('text', {
    nullable: true,
    name: 'reason_description',
  })
  reasonDescription: string | null;

  @Column('bigint', {
    nullable: false,
    name: 'user_id_created',
  })
  userIdCreated: number;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'created_time',
  })
  createdTime: Date;

  @Column('bigint', {
    nullable: false,
    name: 'user_id_updated',
  })
  userIdUpdated: number;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'updated_time',
  })
  updatedTime: Date;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_deleted',
  })
  isDeleted: boolean;

  @Column('boolean', {
    nullable: true,
    default: () => 'true',
    name: 'is_reschedule_pickup',
  })
  isReschedulePickup: boolean | null;

  @Column('boolean', {
    nullable: true,
    default: () => 'true',
    name: 'is_reschedule',
  })
  isReschedule: boolean | null;
}
