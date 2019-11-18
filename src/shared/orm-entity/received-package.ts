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

@Entity('received_package', { schema: 'public' })
export class ReceivedPackage extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  received_package_id: string;

  @Column('character varying', {
    nullable: false,
    length: 255,

  })
  received_package_code: string;

  @Column('bigint', {
    nullable: false,

  })
  employee_id_consignee: string;

  @Column('character varying', {
    nullable: false,
    length: 255,

  })
  sender_name: string;

  @Column('timestamp without time zone', {
    nullable: false,

  })
  received_package_date: Date;

  @Column('bigint', {
    nullable: false,

  })
  user_id: string;

  @Column('bigint', {
    nullable: false,

  })
  branch_id: string;

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

  @Column('integer', {
    nullable: true,

  })
  total_seq: number | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  merchant_name: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  phone: string | null;
}
