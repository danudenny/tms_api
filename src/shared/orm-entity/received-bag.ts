import { Column, Entity, Index, PrimaryGeneratedColumn, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { TmsBaseEntity } from './tms-base';

@Entity('received_bag', { schema: 'public' })
export class ReceivedBag extends TmsBaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'received_bag_id',
  })
  receivedBagId: number;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'received_bag_code',
  })
  receivedBagCode: string;

  @Column('bigint', {
    nullable: false,
    name: 'employee_id_consignee',
  })
  employeeIdConsignee: number;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'received_bag_date',
  })
  receivedBagDate: Date;

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
    nullable: false,
    name: 'total_seq',
  })
  totalSeq: number;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 5,
    name: 'total_bag_weight',
  })
  totalBagWeight: number;

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
