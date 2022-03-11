import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { TmsBaseEntity } from './tms-base';
import { DoSortationStatus } from './do-sortation-status';

@Entity('do_sortation_history', { schema: 'public' })
export class DoSortationHistory extends TmsBaseEntity {
  @PrimaryColumn({
    type: 'uuid',
    name: 'do_sortation_history_id',
  })
  doSortationHistoryId: string;

  @Column({
    nullable: false,
    type: 'uuid',
    name: 'do_sortation_id',
  })
  doSortationId: string;

  @Column({
    nullable: true,
    type: 'uuid',
    name: 'do_sortation_detail_id',
  })
  doSortationDetailId: string;

  @Column({
    nullable: false,
    type: 'uuid',
    name: 'do_sortation_vehicle_id',
  })
  doSortationVehicleId: string;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'do_sortation_time',
  })
  doSortationTime: Date;

  @Column('integer', {
    nullable: false,
    name: 'do_sortation_status_id',
  })
  doSortationStatusId: number;

  @Column('integer', {
    nullable: false,
    name: 'branch_id_from',
  })
  branchIdFrom: number;

  @Column('integer', {
    nullable: true,
    name: 'branch_id_to',
  })
  branchIdTo: number;

  @Column('integer', {
    nullable: true,
    name: 'reason_id',
  })
  reasonId: number;

  @Column('text', {
    nullable: true,
    name: 'reason_note',
  })
  reasonNote: string;

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

  @OneToOne(() => DoSortationStatus)
  @JoinColumn({ name: 'do_sortation_status_id' })
  doSortationStatus: DoSortationStatus;
}
