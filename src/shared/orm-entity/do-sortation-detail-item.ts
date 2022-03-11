import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { TmsBaseEntity } from './tms-base';
import { DoSortationDetail } from './do-sortation-detail';

@Entity('do_sortation_detail_item', { schema: 'public' })
export class DoSortationDetailItem extends TmsBaseEntity {
  @PrimaryColumn({
    type: 'uuid',
    name: 'do_sortation_detail_item_id',
  })
  doSortationDetailItemId: string;

  @Column({
    nullable: true,
    type: 'uuid',
    name: 'do_sortation_detail_id',
  })
  doSortationDetailId: string;

  @Column('integer', {
    nullable: true,
    name: 'bag_item_id',
  })
  bagItemId: number;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_sortir',
  })
  isSortir: boolean;

  @Column('bigint', {
    nullable: false,
    name: 'user_id_created',
  })
  userIdCreated: number;

  @Column('bigint', {
    nullable: false,
    name: 'user_id_updated',
  })
  userIdUpdated: number;

  @Column('boolean', {
    default: () => 'false',
    name: 'is_deleted',
  })
  isDeleted: boolean;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'created_time',
  })
  createdTime: Date;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'updated_time',
  })
  updatedTime: Date;

  @ManyToOne(() => DoSortationDetail, detail => detail.doSortationDetailId)
  doSortationDetail: DoSortationDetail;
}
