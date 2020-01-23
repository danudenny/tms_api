import { Column, BaseEntity, Entity, Index, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { TmsBaseEntity } from './tms-base';
import { Partner } from './partner';

@Entity('awb_partner_log', { schema: 'public' })
export class AwbPartnerLog extends TmsBaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'awb_partner_log_id',
  })
  awbPartnerLogId: number;

  @Column('bigint', {
    nullable: false,
    name: 'partner_id',
  })
  partnerId: number;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'awb_number',
  })
  awbNumber: string;

  @Column('text', {
    nullable: true,
    name: 'request_data',
  })
  requestData: string | null;

  @Column('character varying', {
    nullable: false,
    length: 3,
    name: 'response_code',
  })
  responseCode: string;

  @Column('text', {
    nullable: true,
    name: 'response_data',
  })
  responseData: string | null;

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
