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

@Entity('invoice_detail', { schema: 'public' })
export class InvoiceDetail extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  invoice_detail_id: string;

  @Column('bigint', {
    nullable: true,

  })
  invoice_id: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  type: string | null;

  @Column('bigint', {
    nullable: true,

  })
  awb_price_id: string | null;

  @Column('timestamp without time zone', {
    nullable: true,

  })
  invoice_date: Date | null;

  @Column('numeric', {
    nullable: true,
    default: () => '0',
    precision: 20,
    scale: 5,

  })
  amount: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  component_name: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  component_desc: string | null;

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
