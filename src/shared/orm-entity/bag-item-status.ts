import { BaseEntity, Column, Entity } from 'typeorm';

@Entity('bag_item_status', { schema: 'public' })
export class BagItemStatus extends BaseEntity {
  @Column('integer', {
    nullable: false,
    primary: true,

  })
  bag_item_status_id: number;

  @Column('character varying', {
    nullable: false,
    length: 255,

  })
  bag_item_status_name: string;

  @Column('character varying', {
    nullable: false,
    length: 255,

  })
  bag_item_status_title: string;

  @Column('character varying', {
    nullable: false,
    length: 500,

  })
  bag_item_status_desc: string;

  @Column('bigint', {
    nullable: false,

  })
  user_id_created: string;

  @Column('timestamp without time zone', {
    nullable: false,

  })
  created_time: Date;

  @Column('bigint', {
    nullable: false,

  })
  user_id_updated: string;

  @Column('timestamp without time zone', {
    nullable: false,

  })
  updated_time: Date;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',

  })
  is_deleted: boolean;
}
