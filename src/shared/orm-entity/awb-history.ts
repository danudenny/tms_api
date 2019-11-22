import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { TmsBaseEntity } from './tms-base';

@Entity('awb_history', { schema: 'public' })
@Index('awb_history_item_idx', ['awbItemId'])
@Index('awb_history_status_idx', ['awbStatusId'])
export class AwbHistory extends TmsBaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'awb_history_id',
  })
  awbHistoryId: number;

  @Column('bigint', {
    nullable: true,
    name: 'awb_item_id',
  })
  awbItemId: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'user_id',
  })
  userId: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'branch_id',
  })
  branchId: number | null;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'history_date',
  })
  historyDate: Date;

  @Column('bigint', {
    nullable: true,
    name: 'awb_status_id',
  })
  awbStatusId: number | null;

  @Column('text', {
    nullable: true,
    name: 'awb_note',
  })
  awbNote: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'customer_account_id',
  })
  customerAccountId: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'ref_id_tracking_note',
  })
  refIdTrackingNote: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'ref_id_tracking_site',
  })
  refIdTrackingSite: number | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'ref_id_cust_package',
  })
  refIdCustPackage: string | null;

  @Column('character varying', {
    nullable: true,
    length: 50,
    name: 'ref_awb_number',
  })
  refAwbNumber: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'ref_tracking_site_code',
  })
  refTrackingSiteCode: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'ref_tracking_site_name',
  })
  refTrackingSiteName: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'ref_partner_name',
  })
  refPartnerName: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'ref_recipient_name',
  })
  refRecipientName: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'ref_id_courier',
  })
  refIdCourier: number | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'ref_courier_name',
  })
  refCourierName: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'ref_tracking_type',
  })
  refTrackingType: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'ref_user_created',
  })
  refUserCreated: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'ref_user_updated',
  })
  refUserUpdated: string | null;

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

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'ref_table',
  })
  refTable: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'ref_id',
  })
  refId: number | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'ref_module',
  })
  refModule: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'employee_id_driver',
  })
  employeeIdDriver: number | null;

  @Column('boolean', {
    nullable: true,
    default: () => 'true',
    name: 'is_scan_single',
  })
  isScanSingle: boolean | null;

  @Column('boolean', {
    nullable: true,
    default: () => 'false',
    name: 'is_direction_back',
  })
  isDirectionBack: boolean | null;

  @Column('character varying', {
    nullable: true,
    length: 500,
    name: 'latitude',
  })
  latitude: string | null;

  @Column('character varying', {
    nullable: true,
    length: 500,
    name: 'longitude',
  })
  longitude: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'awb_history_id_prev',
  })
  awbHistoryIdPrev: number | null;

  // new field
  @Column('bigint', {
    nullable: true,
    name: 'awb_id',
  })
  awbId: number | null;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_system_genereted',
  })
  isSystemGenereted: boolean;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'ref_transaction_id',
  })
  refTransactionId: string;

  @Column('character varying', {
    nullable: true,
    length: 500,
    name: 'note_internal',
  })
  noteInternal: string;

  @Column('character varying', {
    nullable: true,
    length: 500,
    name: 'note_public',
  })
  notePublic: string;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'receiver_name',
  })
  receiverName: string;
}
