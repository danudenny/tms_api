import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('partner_same_day_service', { schema: 'public' })
export class PartnerSameDayService extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'partner_same_day_service_id',
  })
  partnerSameDayServiceId: string;

  @Column('character varying', {
    nullable: false,
    length: 100,
    name: 'awb_number',
  })
  awbNumber: string;

  @Column('bigint', {
    nullable: false,
    name: 'partner_id',
  })
  partnerId: number;

  @Column('character varying', {
    nullable: false,
    length: 100,
    name: 'status_partner',
  })
  statusPartner: string;

  @Column('character varying', {
    nullable: true,
    length: 100,
    name: 'assigned_user',
  })
  assignedUser: string;

  @Column('character varying', {
    nullable: true,
    length: 100,
    name: 'cancel_reason',
  })
  cancelReason: string;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'url_image_cancel',
  })
  urlImageCancel: string;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'track_link_pickup',
  })
  trackLinkPickup: string;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'url_image_pickup',
  })
  urlImagePickup: string;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'track_link_drop',
  })
  trackLinkDrop: string;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'url_image_drop',
  })
  urlImageDrop: string;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'creation_time',
  })
  creationTime: Date;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'completion_time',
  })
  completionTime: Date;

  @Column('json', {
    nullable: true,
    name: 'status_updates',
  })
  statusUpdates: {};

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_deleted',
  })
  isDeleted: boolean;
}
