import { Column, Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn, ManyToOne, BaseEntity } from 'typeorm';
import {User} from './user';

@Entity('penalty_category', { schema: 'public' })
export class PenaltyCategory extends BaseEntity {
  @PrimaryGeneratedColumn('uuid',{
    name : 'penalty_category_id'
  })
  penaltyCategoryId: string;

  @Column('character varying', {
    nullable: false,
    length: 100,
    name: 'penalty_category_title',
  })
  penaltyCategoryTitle: string;

  @Column('character varying', {
    nullable: false,
    length: 100,
    name: 'penalty_category_process',
  })
  penaltyCategoryProcess: string;

  @Column('text', {
    nullable: true,
    name: 'penalty_category_desc',
  })
  penaltyCategoryDesc: string | null;

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
  userCreated: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id_updated', referencedColumnName: 'userId'})
  userUpdated: User;
}