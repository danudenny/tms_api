import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TmsBaseEntity } from './tms-base';
import { DoSortationDetail } from './do-sortation-detail';
import { Branch } from './branch';
import { DoSortationVehicle } from './do-sortation-vehicle';
import { DoSortationStatus } from './do-sortation-status';
import { User } from './user';

@Entity('do_sortation', { schema: 'public' })
export class DoSortation extends TmsBaseEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'do_sortation_id',
  })
  doSortationId: string;

  @Column('character varying', {
    nullable: false,
    name: 'do_sortation_code',
    length: 25,
  })
  doSortationCode: string;

  @Column('integer', {
    nullable: false,
    name: 'do_sortation_status_id_last',
  })
  doSortationStatusIdLast: number;

  @Column({
    type: 'uuid',
    name: 'do_sortation_vehicle_id_last',
  })
  doSortationVehicleIdLast: string;

  @Column('character varying', {
    name: 'branch_id_to_list',
    array: true,
    default: 'array[]::string[]',
  })
  branchIdToList: string[];

  @Column('character varying', {
    name: 'branch_name_to_list',
    array: true,
    default: 'array[]::string[]',
  })
  branchNameToList: string[];

  @Column('integer', {
    nullable: false,
    name: 'branch_id_from',
  })
  branchIdFrom: number;

  @Column('integer', {
    nullable: false,
    name: 'trip',
  })
  trip: number;

  @Column('text', {
    name: 'note',
  })
  note: string;

  @Column('integer', {
    nullable: false,
    name: 'total_vehicle',
    default: () => 0,
  })
  totalVehicle: number;

  @Column('integer', {
    nullable: false,
    name: 'total_do_sortation_detail',
    default: () => 0,
  })
  totalDoSortationDetail: number;

  @Column('integer', {
    nullable: false,
    name: 'total_bag',
    default: () => 0,
  })
  totalBag: number;

  @Column('integer', {
    nullable: false,
    name: 'total_bag_sortir',
    default: () => 0,
  })
  totalBagSortir: number;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'do_sortation_time',
  })
  doSortationTime: Date;

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

  @OneToMany(() => DoSortationDetail, detail => detail.doSortationId)
  doSortationDetails: DoSortationDetail[];

  @OneToOne(() => Branch)
  @JoinColumn({ name: 'branch_id_from' })
  branchFrom: Branch;

  @OneToOne(() => DoSortationVehicle)
  @JoinColumn({ name: 'do_sortation_vehicle_id_last' })
  doSortationVehicle: DoSortationVehicle;

  @OneToOne(() => DoSortationStatus)
  @JoinColumn({ name: 'do_sortation_status_id_last' })
  doSortationStatus: DoSortationStatus;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id_created' })
  user: User;
}
