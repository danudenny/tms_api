import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('bag_solution', { schema: 'public' })
export class BagSolution extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'bag_solution_id',
  })
  bagSolutionId: number;

  @Column('bigint', {
    nullable: false,
    name: 'bag_item_history_id',
  })
  bagItemHistoryId: number;

  @Column('bigint', {
    nullable: false,
    name: 'bag_trouble_id',
  })
  bagTroubleId: number;

  @Column('text', {
    nullable: true,
    name: 'bag_solution_desc',
  })
  bagSolutionDesc: string | null;

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
  isDeleted: boolean | null;
}
