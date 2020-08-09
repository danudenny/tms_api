import { BaseEntity, Column, Entity, Index, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import {Representative} from './representative';
import {Branch} from './branch';

@Entity('bag_representative_history', { schema: 'public' })
export class BagRepresentativeHistory extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'bag_representative_history_id',
  })
  bagRepresentativeHistoryId: string;

  @Column('bigint', {
    nullable: false,
    name: 'bag_representative_id',
  })
  bagRepresentativeId: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'bag_representative_code',
  })
  bagRepresentativeCode: string;

  @Column('bigint', {
    nullable: false,
    name: 'branch_id',
  })
  branchId: string;

  @Column('bigint', {
    nullable: false,
    name: 'representative_id_to',
  })
  representativeIdTo: string;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'bag_representative_date',
  })
  bagRepresentativeDate: Date;

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
    name: 'bag_representative_status_id_last',
  })
  bagRepresentativeStatusIdLast: string | null;

  @ManyToOne(() => Representative, representative => representative.representativeId, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'representative_id_to', referencedColumnName: 'representativeId' })
  representative: Representative;

  @ManyToOne(() => Branch, branch => branch.branchId, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'branch_id', referencedColumnName: 'branchId' })
  branch: Branch;
}
