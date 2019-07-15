import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('awb_request', { schema: 'public' })
export class AwbRequest extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'awb_request_id',
  })
  awbRequestId: string;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'awb_request_code',
  })
  awbRequestCode: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'customer_account_id',
  })
  customerAccountId: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'partner_id',
  })
  partnerId: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'awb_number_start',
  })
  awbNumberStart: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'awb_number_end',
  })
  awbNumberEnd: string | null;

  @Column('bigint', {
    nullable: false,
    default: () => '0',
    name: 'total_awb_request',
  })
  totalAwbRequest: string;

  @Column('bigint', {
    nullable: false,
    default: () => '0',
    name: 'total_awb_created',
  })
  totalAwbCreated: string;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'awb_request_status',
  })
  awbRequestStatus: string | null;

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
}
