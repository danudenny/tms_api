import { BaseEntity, Column, Entity, Index, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { BagItem } from './bag-item';

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
  bagId: number;

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
  representativeIdTo: number | null;

  @Column('bigint', {
    nullable: false,
    name: 'user_id_created',
  })
  userIdCreated: number;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'created_time',
  })
  createdTime: Date;

  @Column('bigint', {
    nullable: false,
    name: 'user_id_updated',
  })
  userIdUpdated: number;

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
  userId: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'branch_id',
  })
  branchId: number | null;

  @Column('date', {
    nullable: true,
    name: 'bag_date',
  })
  bagDate: Date | null;

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

  // relation model
  @OneToMany(() => BagItem, e => e.bags, { cascade: ['insert'] })
  bagItems: BagItem[];
}
