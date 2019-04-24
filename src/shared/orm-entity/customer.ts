import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('customer', { schema: 'public' })
export class Customer extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  customer_id: string;

  @Column('character varying', {
    nullable: false,
    length: 255,

  })
  customer_code: string;

  @Column('character varying', {
    nullable: false,
    length: 255,

  })
  customer_name: string;

  @Column('character varying', {
    nullable: true,
    length: 200,

  })
  email1: string | null;

  @Column('character varying', {
    nullable: true,
    length: 200,

  })
  email2: string | null;

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
