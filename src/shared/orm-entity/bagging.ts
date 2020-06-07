import { BaseEntity, Column, Entity, Index, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import {Representative} from './representative';
import {User} from './user';
import {Branch} from './branch';

@Entity('bagging', { schema: 'public' })
@Index('bagging_representative_id_to_idx', ['representativeIdTo'])
@Index('bagging_smu_id_last_idx', ['smuIdLast'])
export class Bagging extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'bagging_id',
  })
  baggingId: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'bagging_code',
  })
  baggingCode: string;

  @Column('bigint', {
    nullable: false,
    name: 'branch_id',
  })
  branchId: string;

  @Column('bigint', {
    nullable: false,
    name: 'user_id',
  })
  userId: string;

  @Column('bigint', {
    nullable: false,
    name: 'representative_id_to',
  })
  representativeIdTo: string;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'product_code',
  })
  productCode: string | null;

  @Column('date', {
    nullable: false,
    name: 'bagging_date',
  })
  baggingDate: string;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'bagging_date_real',
  })
  baggingDateReal: Date;

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
    name: 'smu_id_last',
  })
  smuIdLast: string | null;

  @Column('integer', {
    nullable: false,
    default: () => '0',
    name: 'bagging_seq',
  })
  baggingSeq: number;

  @Column('integer', {
    nullable: false,
    default: () => '0',
    name: 'total_item',
  })
  totalItem: number;

  @Column('numeric', {
    nullable: true,
    precision: 10,
    scale: 5,
    name: 'total_weight',
  })
  totalWeight: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'smu_item_id_last',
  })
  smuItemIdLast: string | null;

  @ManyToOne(() => Representative, representative => representative.representativeId, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'representative_id_to', referencedColumnName: 'representativeId' })
  representative: Representative;

  @ManyToOne(() => User, user => user.userId, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'userId' })
  user: User;

  @ManyToOne(() => Branch, branch => branch.branchId, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'branch_id', referencedColumnName: 'branchId' })
  branch: Branch;
}
