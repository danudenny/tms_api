import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TmsBaseEntity } from './tms-base';
import { DoSortationDetailItem } from './do-sortation-detail-item';
import { Branch } from './branch';
import { DoSortation } from './do-sortation';

@Entity('do_sortation_detail', { schema: 'public' })
export class DoSortationDetail extends TmsBaseEntity {
 @PrimaryGeneratedColumn('uuid', {
    name: 'do_sortation_detail_id',
  })
  doSortationDetailId: string;

  @Column('character varying', {
    nullable: false,
    name: 'do_sortation_id',
  })
  doSortationId: string;

  @Column('character varying', {
    nullable: false,
    name: 'do_sortation_vehicle_id',
  })
  doSortationVehicleId: string;

  @Column('integer', {
    nullable: true,
    name: 'do_sortation_status_id_last',
  })
  doSortationStatusIdLast: number;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'do_sortation_time',
  })
  doSortationTime: Date;

  @Column('integer', {
    nullable: true,
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
    name: 'total_bag',
    default: () => 0,
  })
  totalBag: number;

  @Column('integer', {
    nullable: true,
    name: 'total_bag_sortir',
    default: () => 0,
  })
  totalBagSortir: number;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_sortir',
  })
  isSortir: boolean;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'departure_date_time',
  })
  depatureDateTime: Date;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'arrival_date_time',
  })
  arrivalDateTime: Date;

  @Column('integer', {
    name: 'check_point',
    default: () => 0,
  })
  checkPoint: number;

  @Column('character varying', {
    name: 'longitude_departure',
  })
  longitudeDeparture: string;

  @Column('character varying', {
    name: 'longitude_arrival',
  })
  longitudeArrival: string;

  @Column('character varying', {
    name: 'latitude_departure',
  })
  latitudeDeparture: string;

  @Column('character varying', {
    name: 'latitude_arrival',
  })
  latitudeArrival: string;

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

  @OneToMany(() => DoSortationDetailItem, item => item.doSortationDetailId)
  doSortationDetailItems: DoSortationDetailItem[];

  @OneToOne(() => Branch)
  @JoinColumn({ name: 'branch_id_from' })
  branchFrom: Branch;

  @OneToOne(() => Branch)
  @JoinColumn({ name: 'branch_id_to' , referencedColumnName: 'branchId'})
  branchTo: Branch;

  @ManyToOne(() => DoSortation, sortation => sortation.doSortationId)
  @JoinColumn({name: 'do_sortation_id', referencedColumnName: 'doSortationId'})
  doSortation: DoSortation;
}
