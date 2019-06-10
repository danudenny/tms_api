import { BaseEntity, Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('awb_history', { schema: 'public' })
@Index('awb_history_item_idx', ['awbItemId'])
@Index('awb_history_status_idx', ['awbStatusId'])
export class AwbHistory extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name:'awb_history_id',
  })
  awbHistoryId: string;

  @Column('bigint', {
    nullable: true,
    name:'awb_item_id',
  })
  awbItemId: string | null;

  @Column('bigint', {
    nullable: true,
    name:'user_id',
  })
  userId: string | null;

  @Column('bigint', {
    nullable: true,
    name:'branch_id',
  })
  branchId: string | null;

  @Column('timestamp without time zone', {
    nullable: false,
    name:'history_date',
  })
  historyDate: Date;

  @Column('bigint', {
    nullable: true,
    name:'awb_status_id',
  })
  awbStatusId: string | null;

  @Column('text', {
    nullable: true,
    name:'awb_note',
  })
  awbNote: string | null;

  @Column('bigint', {
    nullable: true,
    name:'customer_account_id',
  })
  customerAccountId: string | null;

  @Column('bigint', {
    nullable: true,
    name:'ref_id_tracking_note',
  })
  refIdTrackingNote: string | null;

  @Column('bigint', {
    nullable: true,
    name:'ref_id_tracking_site',
  })
  refIdTrackingSite: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name:'ref_id_cust_package',
  })
  refIdCustPackage: string | null;

  @Column('character varying', {
    nullable: true,
    length: 50,
    name:'ref_awb_number',
  })
  refAwbNumber: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name:'ref_tracking_site_code',
  })
  refTrackingSiteCode: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name:'ref_tracking_site_name',
  })
  refTrackingSiteName: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name:'ref_partner_name',
  })
  refPartnerName: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name:'ref_recipient_name',
  })
  refRecipientName: string | null;

  @Column('bigint', {
    nullable: true,
    name:'ref_id_courier',
  })
  refIdCourier: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name:'ref_courier_name',
  })
  refCourierName: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name:'ref_tracking_type',
  })
  refTrackingType: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name:'ref_user_created',
  })
  refUserCreated: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name:'ref_user_updated',
  })
  refUserUpdated: string | null;

  @Column('bigint', {
    nullable: false,
    name:'user_id_created',
  })
  userIdCreated: string;

  @Column('timestamp without time zone', {
    nullable: false,
    name:'created_time',
  })
  createdTime: Date;

  @Column('bigint', {
    nullable: false,
    name:'user_id_updated',
  })
  userIdUpdated: string;

  @Column('timestamp without time zone', {
    nullable: false,
    name:'updated_time',
  })
  updatedTime: Date;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name:'is_deleted',
  })
  isDeleted: boolean;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name:'ref_table',
  })
  refTable: string | null;

  @Column('bigint', {
    nullable: true,
    name:'ref_id',
  })
  refId: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name:'ref_module',
  })
  refModule: string | null;

  @Column('bigint', {
    nullable: true,
    name:'employee_id_driver',
  })
  employeeIdDriver: string | null;

  @Column('boolean', {
    nullable: true,
    default: () => 'true',
    name:'is_scan_single',
  })
  isScanSingle: boolean | null;

  @Column('boolean', {
    nullable: true,
    default: () => 'false',
    name:'is_direction_back',
  })
  isDirectionBack: boolean | null;

  @Column('character varying', {
    nullable: true,
    length: 500,
    name:'latitude',
  })
  latitude: string | null;

  @Column('character varying', {
    nullable: true,
    length: 500,
    name:'longitude',
  })
  longitude: string | null;

  @Column('bigint', {
    nullable: true,
    name:'awb_history_id_prev',
  })
  awbHistoryIdPrev: string | null;
}
