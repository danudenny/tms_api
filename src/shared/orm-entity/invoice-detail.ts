import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('invoice_detail', { schema: 'public' })
export class InvoiceDetail extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'invoice_detail_id',
  })
  invoiceDetailId: string;

  @Column('bigint', {
    nullable: true,
    name: 'invoice_id',
  })
  invoiceId: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'type',
  })
  type: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'awb_price_id',
  })
  awbPriceId: string | null;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'invoice_date',
  })
  invoiceDate: Date | null;

  @Column('numeric', {
    nullable: true,
    default: () => '0',
    precision: 20,
    scale: 5,
    name: 'amount',
  })
  amount: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'component_name',
  })
  componentName: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'component_desc',
  })
  componentDesc: string | null;

  @Column('bigint', {
    nullable: false,
    name: 'user_id_created',
  })
  userIdCreated: string;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'created_time',
  })
  createdTime: Date;

  @Column('bigint', {
    nullable: false,
    name: 'user_id_updated',
  })
  userIdUpdated: string;

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
}
