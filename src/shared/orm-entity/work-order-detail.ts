import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TmsBaseEntity } from './tms-base';

@Entity('work_order_detail', { schema: 'public' })
export class WorkOrderDetail extends TmsBaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'work_order_detail_id',
  })
  workOrderDetailId: number;

  @Column('bigint', {
    nullable: false,
    name: 'work_order_id',
  })
  workOrderId: number;

  @Column('bigint', {
    nullable: true,
    name: 'pickup_request_id',
  })
  pickupRequestId: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'awb_item_id',
  })
  awbItemId: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'work_order_status_id_last',
  })
  workOrderStatusIdLast: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'reason_id',
  })
  reasonId: number | null;

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
  workOrderStatusIdPick: number | null;

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
