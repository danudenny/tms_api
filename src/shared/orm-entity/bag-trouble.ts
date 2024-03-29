import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TmsBaseEntity } from './tms-base';

@Entity('bag_trouble', { schema: 'public' })
export class BagTrouble extends TmsBaseEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'bag_trouble_id',
  })
  bagTroubleId: string;

  @Column('bigint', {
    nullable: false,
    name: 'bag_status_id',
  })
  bagStatusId: number;

  @Column('bigint', {
    nullable: false,
    name: 'transaction_status_id',
  })
  transactionStatusId: number;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'bag_number',
  })
  bagNumber: string;

  @Column('character varying', {
    nullable: false,
    length: 50,
    name: 'bag_trouble_code',
  })
  bagTroubleCode: string;

  @Column('integer', {
    nullable: false,
    name: 'bag_trouble_status',
  })
  bagTroubleStatus: number;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'resolve_date_time',
  })
  resolveDateTime: Date | null;

  // @Column('bigint', {
  //   nullable: false,
  //   name: 'status_resolve_id',
  // })
  // statusResolveId: number;

  @Column('bigint', {
    nullable: false,
    name: 'employee_id',
  })
  employeeId: number;

  @Column('bigint', {
    nullable: false,
    name: 'branch_id',
  })
  branchId: number;

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
  isDeleted: boolean | false;

  @Column('text', {
    nullable: true,
  })
  description: string | null;
}
