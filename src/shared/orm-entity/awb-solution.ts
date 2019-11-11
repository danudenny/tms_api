import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('awb_solution', { schema: 'public' })
export class AwbSolution extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'awb_solution_id',
  })
  awbSolutionId: string;

  @Column('bigint', {
    nullable: false,
    name: 'awb_history_id',
  })
  awbHistoryId: number;

  @Column('character varying', {
    nullable: false,
    length: 50,
    name: 'awb_trouble_id',
  })
  awbTroubleId: string;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'awb_solution_desc',
  })
  awbSolutionDesc: Date | null;

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
  isDeleted: boolean | null;
}
