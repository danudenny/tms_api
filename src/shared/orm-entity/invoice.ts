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

@Entity('invoice', { schema: 'public' })
export class Invoice extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  invoice_id: string;

  @Column('bigint', {
    nullable: true,

  })
  invoice_id_parent: string | null;

  @Column('integer', {
    nullable: true,

  })
  invoice_code: number | null;

  @Column('integer', {
    nullable: true,

  })
  invoice_seq: number | null;

  @Column('timestamp without time zone', {
    nullable: true,

  })
  invoice_date: Date | null;

  @Column('timestamp without time zone', {
    nullable: true,

  })
  awb_start_date: Date | null;

  @Column('timestamp without time zone', {
    nullable: true,

  })
  awb_end_date: Date | null;

  @Column('timestamp without time zone', {
    nullable: true,

  })
  reminder_date: Date | null;

  @Column('bigint', {
    nullable: true,

  })
  customer_account_id: string | null;

  @Column('character varying', {
    nullable: true,
    length: 100,

  })
  email: string | null;

  @Column('numeric', {
    nullable: true,
    default: () => '0',
    precision: 20,
    scale: 5,

  })
  amount: string | null;

  @Column('numeric', {
    nullable: true,
    default: () => '0',
    precision: 20,
    scale: 5,

  })
  weight: string | null;

  @Column('numeric', {
    nullable: true,
    default: () => '0',
    precision: 20,
    scale: 5,

  })
  total_awb: string | null;

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
