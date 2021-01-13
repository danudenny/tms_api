import { Column, Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn, ManyToOne, BaseEntity } from 'typeorm';
import {User} from './user';
import {Branch} from './branch';
import {PenaltyCategory} from './penalty_category';

@Entity('employee_penalty', { schema: 'public' })
export class EmployeePenalty extends BaseEntity {

  @PrimaryGeneratedColumn('uuid',{
    name : 'employee_penalty_id'
  })
  employeePenaltyId: string;

  @Column('bigint', {
    nullable: false,
    name: 'penalty_user_id',
  })
  penaltyUserId: number;

  @Column('timestamp', {
    nullable: false,
    name: 'penalty_date_time',
  })
  penaltyDateTime: Date;

  @Column('character varying', {
    nullable: false,
    name: 'penalty_category_id',
  })
  penaltyCategoryId: string;

  @Column('integer', {
    nullable: false,
    default: () => '1',
    name: 'penalty_qty',
  })
  penaltyQty: number;

  @Column('numeric', {
    nullable: false,
    precision: 20,
    scale: 2,
    name: 'penalty_fee',
  })
  penaltyFee: number;

  @Column('numeric', {
    nullable: false,
    precision: 20,
    scale: 2,
    name: 'total_penalty',
  })
  totalPenalty: number;

  @Column('bigint', {
    nullable: false,
    name: 'branch_id',
  })
  branchId: number;

  @Column('bigint', {
    nullable: false,
    name: 'representative_id',
  })
  representativeId: number;

  @Column('character varying', {
    nullable: true,
    length: 20,
    name: 'ref_awb_number',
  })
  refAwbNumber: string;

  @Column('character varying', {
    nullable: true,
    length: 250,
    name: 'ref_spk_code',
  })
  refSpkCode: string;

  @Column('text', {
    nullable: true,
    name: 'penalty_desc',
  })
  penaltyDesc: string | null;

  @Column('text', {
    nullable: true,
    name: 'penalty_type',
  })
  penaltyType: string | null;

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

  @ManyToOne(() => User)
  @JoinColumn({ name: 'penalty_user_id', referencedColumnName: 'userId'})
  penaltyUser: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id_created', referencedColumnName: 'userId'})
  createdUser: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id_updated', referencedColumnName: 'userId'})
  updatedUser: User;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @ManyToOne(() => PenaltyCategory)
  @JoinColumn({ name: 'penalty_category_id' })
  penaltyCategory: PenaltyCategory;

}