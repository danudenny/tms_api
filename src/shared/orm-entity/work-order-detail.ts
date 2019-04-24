import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('work_order_detail', { schema: 'public' })
export class WorkOrderDetail extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'work_order_detail_id',
  })
  workOrderDetailId: string;

  @Column('bigint', {
    nullable: false,
    name: 'work_order_id',
  })
  workOrderId: string;

  @Column('bigint', {
    nullable: true,
    name: 'pickup_request_id',
  })
  pickupRequestId: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'awb_item_id',
  })
  awbItemId: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'work_order_status_id_last',
  })
  workOrderStatusIdLast: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'reason_id',
  })
  reasonId: string | null;

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

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'pickup_date_time',
  })
  pickupDateTime: Date | null;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'check_in_date_time',
  })
  checkInDateTime: Date | null;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'check_out_date_time',
  })
  checkOutDateTime: Date | null;

  @Column('bigint', {
    nullable: true,
    name: 'work_order_status_id_pick',
  })
  workOrderStatusIdPick: string | null;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'drop_date_time',
  })
  dropDateTime: Date | null;

  @Column('character varying', {
    nullable: true,
    length: 100,
    name: 'ref_awb_number',
  })
  refAwbNumber: string | null;
}
