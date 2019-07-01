import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('do_pod_deliver_detail', { schema: 'public' })
export class DoPodDeliverDetail extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'do_pod_deliver_detail_id',
  })
  doPodDeliverDetailId: number;

  @Column('bigint', {
    name: 'do_pod_deliver_id',
  })
  doPodDeliverId: number;

  @Column('bigint', {
    nullable: false,
    name: 'employee_journey_id_out',
  })
  employeeJourneyIdOut: number;

  @Column('bigint', {
    nullable: false,
    name: 'employee_journey_id_in',
  })
  employeeJourneyIdIn: number;

  @Column('bigint', {
    nullable: false,
    name: 'do_pod_status_id_last',
  })
  doPodStatusIdLast: number;

  @Column('bigint', {
    nullable: false,
    name: 'awb_item_id',
  })
  awbItemId: number;

  @Column('character varying', {
    nullable: true,
    length: 100,
    name: 'longitude_delivery',
  })
  longitudeDelivery: string | null;

  @Column('character varying', {
    nullable: true,
    length: 100,
    name: 'latitude_delivery',
  })
  latitudeDelivery: string | null;

  @Column('text', {
    nullable: true,
  })
  description: string | null;

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
}
