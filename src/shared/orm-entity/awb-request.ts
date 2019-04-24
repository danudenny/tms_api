import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('awb_request', { schema: 'public' })
export class AwbRequest extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  awb_request_id: string;

  @Column('character varying', {
    nullable: true,
    length: 255,
  })
  awb_request_code: string | null;

  @Column('bigint', {
    nullable: true,
  })
  customer_account_id: string | null;

  @Column('bigint', {
    nullable: true,
  })
  partner_id: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
  })
  awb_number_start: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
  })
  awb_number_end: string | null;

  @Column('bigint', {
    nullable: false,
    default: () => '0',
  })
  total_awb_request: string;

  @Column('bigint', {
    nullable: false,
    default: () => '0',
  })
  total_awb_created: string;

  @Column('character varying', {
    nullable: true,
    length: 255,
  })
  awb_request_status: string | null;

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
