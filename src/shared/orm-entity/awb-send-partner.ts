import { Column, Entity, Index, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { TmsBaseEntity } from './tms-base';
import { Partner } from './partner';

@Entity('awb_send_partner', { schema: 'public' })
export class AwbSendPartner extends TmsBaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'awb_send_partner_id',
  })
  awbSendPartnerId: number;

  @Column('bigint', {
    nullable: false,
    name: 'partner_id',
  })
  partnerId: number;

  @Column('character varying',{
    nullable: false,
    length: 255,
    name: 'awb_number',
  })
  awbNumber: string;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_send',
  })
  isSend: boolean;

  @Column('int', {
    nullable: false,
    default: () => 0,
    name: 'send_count',
  })
  sendCount: number;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'last_send_date_time',
  })
  lastSendDateTime: Date;

  @Column('character varying',{
    nullable: true,
    length: 3,
    name: 'response_code',
  })
  responseCode: string;

  @Column('text',{
    nullable: true,
    name: 'response_data',
  })
  responseData: string;

  @Column('text',{
    nullable: true,
    name: 'send_data',
  })
  sendData: string;

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
