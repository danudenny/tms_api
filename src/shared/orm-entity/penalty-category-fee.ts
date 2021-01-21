import { Column, Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn, ManyToOne, BaseEntity } from 'typeorm';
import { PenaltyCategory } from './penalty_category';
import {User} from './user';

@Entity('penalty_category_fee', { schema: 'public' })
export class PenaltyCategoryFee extends BaseEntity {
  @PrimaryGeneratedColumn('uuid',{
    name : 'penalty_category_fee_id'
  })
  penaltyCategoryFeeId: string;

  @Column('character varying', {
    nullable: false,
    name: 'penalty_category_id',
  })
  penaltyCategoryId: string;

  @Column('numeric', {
    nullable: false,
    precision: 20,
    scale: 2,
    name: 'penalty_fee',
  })
  penaltyFee: number;

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
  @JoinColumn({ name: 'user_id_created', referencedColumnName: 'userId'})
  createdUser: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id_updated', referencedColumnName: 'userId'})
  updatedUser: User;

  @ManyToOne(() => PenaltyCategory)
  @JoinColumn({ name: 'penalty_category_id' })
  penaltyCategory: PenaltyCategory;
}