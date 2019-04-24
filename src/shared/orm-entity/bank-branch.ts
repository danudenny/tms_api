import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('bank_branch', { schema: 'public' })
export class BankBranch extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  bank_branch_id: string;

  @Column('bigint', {
    nullable: false,

  })
  bank_id: string;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  bank_branch_name: string | null;

  @Column('text', {
    nullable: true,

  })
  address: string | null;

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
