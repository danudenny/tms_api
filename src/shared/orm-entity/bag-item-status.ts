import { BaseEntity, Column, Entity } from 'typeorm';

@Entity('bag_item_status', { schema: 'public' })
export class BagItemStatus extends BaseEntity {
  @Column('integer', {
    nullable: false,
    primary: true,
    name: 'bag_item_status_id',
  })
  bagItemStatusId: number;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'bag_item_status_name',
  })
  bagItemStatusName: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'bag_item_status_title',
  })
  bagItemStatusTitle: string;

  @Column('character varying', {
    nullable: false,
    length: 500,
    name: 'bag_item_status_desc',
  })
  bagItemStatusDesc: string;

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
