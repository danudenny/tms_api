import { BaseEntity, Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('bag', { schema: 'public' })
@Index('bag_bag_date_idx', ['bag_date'])
@Index('bag_bag_number_idx', ['bag_number'])
@Index('bag_branch_id_idx', ['branch_id'])
@Index('bag_created_time_idx', ['created_time'])
@Index('bag_is_deleted_idx', ['is_deleted'])
export class Bag extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  bag_id: string;

  @Column('character varying', {
    nullable: false,
    length: 255,

  })
  bag_number: string;

  @Column('bigint', {
    nullable: true,

  })
  representative_id_to: string | null;

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

  @Column('bigint', {
    nullable: true,

  })
  user_id: string | null;

  @Column('bigint', {
    nullable: true,

  })
  branch_id: string | null;

  @Column('date', {
    nullable: true,

  })
  bag_date: string | null;

  @Column('timestamp without time zone', {
    nullable: true,

  })
  bag_date_real: Date | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  ref_branch_code: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  ref_representative_code: string | null;
}
