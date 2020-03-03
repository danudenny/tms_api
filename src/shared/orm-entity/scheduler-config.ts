import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { TmsBaseEntity } from './tms-base';

@Entity('scheduler_config', { schema: 'public' })
export class SchedulerConfig extends TmsBaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'scheduler_config_id',
  })
  schedulerConfigId: number;

  @Column('bigint', {
    nullable: false,
    name: 'work_order_history_id_last',
  })
  workOrderHistoryIdLast: number;

  @Column('character varying', {
    length: 255,
    name: 'scheduler_type',
  })
  schedulerType: string;

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

}
