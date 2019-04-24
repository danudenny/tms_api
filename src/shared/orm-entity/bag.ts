import { BaseEntity, Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('bag', { schema: 'public' })
@Index('bag_bag_date_idx', ['bagDate'])
@Index('bag_bag_number_idx', ['bagNumber'])
@Index('bag_branch_id_idx', ['branchId'])
@Index('bag_created_time_idx', ['createdTime'])
@Index('bag_is_deleted_idx', ['isDeleted'])
export class Bag extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'bag_id',
  })
  bagId: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'bag_number',
  })
  bagNumber: string;

  @Column('bigint', {
    nullable: true,
    name: 'representative_id_to',
  })
  representativeIdTo: string | null;

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

  @Column('bigint', {
    nullable: true,
    name: 'user_id',
  })
  userId: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'branch_id',
  })
  branchId: string | null;

  @Column('date', {
    nullable: true,
    name: 'bag_date',
  })
  bagDate: string | null;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'bag_date_real',
  })
  bagDateReal: Date | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'ref_branch_code',
  })
  refBranchCode: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'ref_representative_code',
  })
  refRepresentativeCode: string | null;
}
