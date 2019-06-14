import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('do_pod', { schema: 'public' })
export class DoPod extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'do_pod_id',
  })
  doPodId: number;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'do_pod_code',
  })
  doPodCode: string;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'ref_do_pod_code',
  })
  refDoPodCode: string | null;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'do_pod_date_time',
  })
  doPodDateTime: Date;

  @Column('bigint', {
    nullable: false,
    name: 'user_id',
  })
  userId: number;

  @Column('bigint', {
    nullable: false,
    name: 'branch_id',
  })
  branchId: number;

  @Column('bigint', {
    nullable: true,
    name: 'branch_id_to',
  })
  branchIdTo: number | null;

  @Column('integer', {
    nullable: true,
    name: 'total_assigned',
  })
  totalAssigned: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'user_id_driver',
  })
  userIdDriver: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'employee_id_driver',
  })
  employeeIdDriver: number | null;

  @Column('character varying', {
    nullable: true,
    length: 100,
    name: 'latitude_last',
  })
  latitudeLast: string | null;

  @Column('character varying', {
    nullable: true,
    length: 100,
    name: 'longitude_last',
  })
  longitudeLast: string | null;

  @Column('integer', {
    nullable: false,
    default: () => '0',
    name: 'total_item',
  })
  totalItem: number;

  @Column('integer', {
    nullable: false,
    default: () => '0',
    name: 'total_pod_item',
  })
  totalPodItem: number;

  @Column('numeric', {
    nullable: false,
    default: () => '0',
    precision: 20,
    scale: 5,
    name: 'total_weight',
  })
  totalWeight: number;

  @Column('bigint', {
    nullable: true,
    name: 'do_pod_status_id_last',
  })
  doPodStatusIdLast: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'do_pod_history_id_last',
  })
  doPodHistoryIdLast: number | null;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'history_date_time_last',
  })
  historyDateTimeLast: Date | null;

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

  @Column('integer', {
    nullable: true,
    name: 'do_pod_type',
  })
  doPodType: number | null;

  @Column('integer', {
    nullable: true,
    name: 'third_party_id',
  })
  thirdPartyId: number | null;

  @Column('bigint', {
    nullable: false,
    name: 'partner_logistic_id',
  })
  partnerLogisticId: number;
}
