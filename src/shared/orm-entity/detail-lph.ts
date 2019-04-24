import { BaseEntity, Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('detail_lph', { schema: 'public' })
@Index('detail_lph_customer_account_id_idx', ['customer_account_id'])
@Index('detail_lph_lph_id_idx', ['lph_id'])
@Index('detail_lph_status_email_idx', ['status_email'])
export class DetailLph extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  detail_lph_id: string;

  @Column('bigint', {
    nullable: true,

  })
  lph_id: string | null;

  @Column('bigint', {
    nullable: true,

  })
  customer_account_id: string | null;

  @Column('character varying', {
    nullable: true,
    length: 500,

  })
  pdf_url: string | null;

  @Column('character varying', {
    nullable: true,
    length: 1,

  })
  status_email: string | null;

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
