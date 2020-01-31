import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TmsBaseEntity } from './tms-base';

@Entity('work_order', { schema: 'public' })
@Index('work_order_branch_id_assigned_idx', ['branch_id_assigned'])
@Index('work_order_customer_account_id_idx', ['customer_account_id'])
@Index('work_order_is_deleted_idx', ['is_deleted'])
export class WorkOrder extends TmsBaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'work_order_id',
  })
  workOrderId: number;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'work_order_code',
  })
  workOrderCode: string;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'work_order_date',
  })
  workOrderDate: Date;

  @Column('bigint', {
    nullable: false,
    name: 'user_id',
  })
  userId: number;

  @Column('bigint', {
    nullable: false,
    name: 'branch_id',
  })
  branchId: number;

  @Column('boolean', {
    nullable: false,
    name: 'is_member',
  })
  isMember: boolean;

  @Column('bigint', {
    nullable: true,
    name: 'customer_account_id',
  })
  customerAccountId: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'customer_account_id_child',
  })
  customerAccountIdChild: number | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'guest_name',
  })
  guestName: string | null;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'pickup_schedule_date_time',
  })
  pickupScheduleDateTime: Date;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'pickup_phone',
  })
  pickupPhone: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'pickup_email',
  })
  pickupEmail: string | null;

  @Column('text', {
    nullable: true,
    name: 'pickup_address',
  })
  pickupAddress: string | null;

  @Column('text', {
    nullable: true,
    name: 'pickup_notes',
  })
  pickupNotes: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'branch_id_assigned',
  })
  branchIdAssigned: number | null;

  @Column('integer', {
    nullable: true,
    default: () => '0',
    name: 'total_assigned',
  })
  totalAssigned: number | null;

  @Column('boolean', {
    nullable: true,
    default: () => 'false',
    name: 'is_assigned',
  })
  isAssigned: boolean | null;

  @Column('bigint', {
    nullable: true,
    name: 'employee_id_driver',
  })
  employeeIdDriver: number | null;

  @Column('character varying', {
    nullable: true,
    length: 100,
    name: 'latitude_last',
  })
  latitudeLast: string | null;

  @Column('character varying', {
    nullable: true,
    length: 100,
    name: 'longitude_last',
  })
  longitudeLast: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'consignee_name',
  })
  consigneeName: string | null;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'received_date_time',
  })
  receivedDateTime: Date | null;

  @Column('integer', {
    nullable: false,
    default: () => '0',
    name: 'total_item',
  })
  totalItem: number;

  @Column('integer', {
    nullable: false,
    default: () => '0',
    name: 'total_pickup_item',
  })
  totalPickupItem: number;

  @Column('numeric', {
    nullable: false,
    default: () => '0',
    precision: 20,
    scale: 5,
    name: 'total_weight',
  })
  totalWeight: number;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'history_date_time_last',
  })
  historyDateTimeLast: Date | null;

  @Column('bigint', {
    nullable: true,
    name: 'work_order_status_id_last',
  })
  workOrderStatusIdLast: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'work_order_history_id_last',
  })
  workOrderHistoryIdLast: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'do_pickup_detail_id_last',
  })
  doPickupDetailIdLast: number | null;

  @Column('character varying', {
    nullable: false,
    length: 50,
    name: 'work_order_type',
  })
  workOrderType: string;

  @Column('text', {
    nullable: true,
    name: 'work_order_group',
  })
  workOrderGroup: string | null;

  @Column('character varying', {
    nullable: true,
    length: 100,
    name: 'encrypt_address100',
  })
  encryptAddress100: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'encrypt_address255',
  })
  encryptAddress255: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'do_pickup_id_last',
  })
  doPickupIdLast: number | null;

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

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'work_order_uid',
  })
  workOrderUid: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'reason_id',
  })
  reasonId: number | null;

  @Column('text', {
    nullable: true,
  })
  reason_note: string | null;

  @Column('integer', {
    nullable: true,
    default: () => '0',
    name: 'total_awb_qty',
  })
  totalAwbQty: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'work_order_status_id_pick',
  })
  workOrderStatusIdPick: string | null;

  @Column('text', {
    nullable: true,
    name: 'sigesit_notes',
  })
  sigesitNotes: string | null;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'drop_date_time',
  })
  dropDateTime: Date | null;

  @Column('boolean', {
    nullable: true,
    default: () => 'false',
    name: 'is_final',
  })
  isFinal: boolean | null;

  @Column('bigint', {
    nullable: true,
    name: 'ref_work_order_id',
  })
  refWorkOrderId: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'item_type',
  })
  itemType: number | null;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'merchant_name',
  })
  merchantName: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'encrypt_merchant_name',
  })
  encryptMerchantName: string;

  @Column('integer', {
    nullable: false,
    default: () => '0',
    name: 'do_status',
  })
  doStatus: number;

  @Column('boolean', {
    nullable: true,
    name: 'is_finished',
  })
  isFinished: boolean;

  @Column('boolean', {
    nullable: true,
    name: 'is_manifested',
  })
  isManifested: boolean;

  @Column('bigint', {
    nullable: true,
    name: 'branch_partner_id',
  })
  branchPartnerId: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'partner_id_assigned',
  })
  partnerIdAssigned: number | null;
}
