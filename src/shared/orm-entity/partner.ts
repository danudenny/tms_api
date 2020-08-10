import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TmsBaseEntity } from './tms-base';

@Entity('partner', { schema: 'public' })
export class Partner extends TmsBaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  partner_id: string;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'partner_name',
  })
  partnerName: string | null;

  @Column('character varying', {
    nullable: true,
    length: 500,
    name: 'partner_email',
  })
  partnerEmail: string | null;

  @Column('character varying', {
    nullable: true,
    length: 500,
    name: 'api_key',
  })
  apiKey: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'customer_account_id',
  })
  customerAccountId: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'awb_number_start',
  })
  awbNumberStart: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'awb_number_end',
  })
  awbNumberEnd: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'current_awb_number',
  })
  currentAwbNumber: string | null;

  @Column('integer', {
    nullable: true,
    name: 'sla_hour_pickup',
  })
  slaHourPickup: number | null;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_active',
  })
  isActive: boolean;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_email_log',
  })
  isEmailLog: boolean;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_assign_to_branch',
  })
  isAssignToBranch: boolean;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_assign_to_courier',
  })
  isAssignToCourier: boolean;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_pick_unpick',
  })
  isPickUnpick: boolean;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_reschedule',
  })
  isReschedule: boolean;

  @Column('character varying', {
    nullable: true,
    length: 20,
    name: 'sm_code',
  })
  smCode: string | null;

  @Column('json', {
    nullable: true,
    name: 'validation',
  })
  validation: Object | null;

  @Column('character varying', {
    nullable: true,
    name: 'partner_id_sur',
  })
  partnerIdSur: string | null;
}
