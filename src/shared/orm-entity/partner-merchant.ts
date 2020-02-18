import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { TmsBaseEntity } from './tms-base';
import { Partner } from './partner';

@Entity('partner_merchant', { schema: 'public' })
export class PartnerMerchant extends TmsBaseEntity {
  @PrimaryGeneratedColumn({
    type: 'uuid',
    name: 'partner_merchant_id',
  })
  awbSendPartnerId: number;

  @Column('bigint', {
    nullable: false,
    name: 'partner_id',
  })
  partnerId: number;

  @Column('bigint', {
    nullable: false,
    name: 'branch_id',
  })
  branchId: number;

  @Column('character varying', {
    length: 255,
    name: 'partner_merchant_code',
  })
  partnerMerchantCode: string;

  @Column('character varying', {
    length: 255,
    name: 'merchant_code',
  })
  merchantCode: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'merchant_name',
  })
  merchantName: string;

  @Column('text', {
    name: 'merchant_address',
  })
  merchantAddress: string;

  @Column('character varying', {
    length: 255,
    name: 'merchant_email',
  })
  merchantEmail: string;

  @Column('character varying', {
    length: 255,
    name: 'merchant_phone',
  })
  merchantPhone: string;

  @Column('time without time zone', {
    nullable: false,
    name: 'pickup_time',
  })
  pickupTime: string;

  @Column('character varying', {
    length: 100,
    name: 'pickup_type',
  })
  pickupType: string;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_edited',
  })
  isEdited: boolean;

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

  @ManyToOne(() => Partner)
  @JoinColumn({ name: 'partner_id', referencedColumnName: 'partner_id' })
  partner: Partner;

}
