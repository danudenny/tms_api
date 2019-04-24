import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('received_package', { schema: 'public' })
export class ReceivedPackage extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'received_package_id',
  })
  receivedPackageId: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'received_package_code',
  })
  receivedPackageCode: string;

  @Column('bigint', {
    nullable: false,
    name: 'employee_id_consignee',
  })
  employeeIdConsignee: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'sender_name',
  })
  senderName: string;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'received_package_date',
  })
  receivedPackageDate: Date;

  @Column('bigint', {
    nullable: false,
    name: 'user_id',
  })
  userId: string;

  @Column('bigint', {
    nullable: false,
    name: 'branch_id',
  })
  branchId: string;

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

  @Column('integer', {
    nullable: true,
    name: 'total_seq',
  })
  totalSeq: number | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'merchant_name',
  })
  merchantName: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'phone',
  })
  phone: string | null;
}
