import { BaseEntity, Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('pickup_request_invalid', { schema: 'public' })
@Index('pickup_request_invalid_created_time', ['createdTime'])
@Index('pickup_request_invalid_ref_awb_number', ['refAwbNumber'])
export class PickupRequestInvalid extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'pickup_request_invalid_id',
  })
  pickupRequestInvalidId: string;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'pickup_request_date_time',
  })
  pickupRequestDateTime: Date | null;

  @Column('character varying', {
    nullable: true,
    length: 100,
    name: 'ref_awb_number',
  })
  refAwbNumber: string | null;

  @Column('character varying', {
    nullable: true,
    length: 500,
    name: 'message_error',
  })
  messageError: string | null;

  @Column('json', {
    nullable: true,
    name: 'request',
  })
  request: Object | null;

  @Column('bigint', {
    nullable: true,
    name: 'partner_id',
  })
  partnerId: string | null;

  @Column('bigint', {
    nullable: false,
    name: 'user_id_created',
  })
  userIdCreated: string;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'user_created',
  })
  userCreated: string | null;

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

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'user_updated',
  })
  userUpdated: string | null;

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
