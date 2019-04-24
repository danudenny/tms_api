import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('bank', { schema: 'public' })
export class Bank extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  bank_id: string;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  bank_code: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  bank_name: string | null;

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
