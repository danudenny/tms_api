import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TmsBaseEntity } from './tms-base';

@Entity('bag_item_history', { schema: 'public' })
export class BagItemHistory extends TmsBaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'bag_item_history_id',
  })
  bagItemHistoryId: string;

  @Column('bigint', {
    nullable: false,
    name: 'bag_item_id',
  })
  bagItemId: string;

  @Column('bigint', {
    nullable: true,
    name: 'user_id',
  })
  userId: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'branch_id',
  })
  branchId: string | null;

  @Column('bigint', {
    nullable: false,
    name: 'bag_item_status_id',
  })
  bagItemStatusId: string;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'history_date',
  })
  historyDate: Date;

  @Column('text', {
    nullable: true,
  })
  note: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'ref_table',
  })
  refTable: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'ref_id',
  })
  refId: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'ref_module',
  })
  refModule: string | null;
}
