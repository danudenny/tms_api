import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('work_order_status', { schema: 'public' })
export class WorkOrderStatus extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'work_order_status_id',
  })
  workOrderStatusId: string;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'status_code',
  })
  statusCode: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'status_title',
  })
  statusTitle: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'status_name',
  })
  statusName: string | null;

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

  @Column('boolean', {
    nullable: true,
    default: () => 'false',
    name: 'is_show_on_filter',
  })
  isShowOnFilter: boolean | null;
}
