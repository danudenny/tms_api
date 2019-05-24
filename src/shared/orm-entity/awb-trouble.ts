import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('awb_trouble', { schema: 'public' })
export class AwbTrouble extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name:'awb_trouble',
  })
  awbTrouble: string;

  @Column('bigint', {
    nullable: false,
    name:'awb_status_id',
  })
  awbStatusId: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name:'awb_number',
  })
  awbNumber: string;

  @Column('timestamp without time zone', {
    nullable: true,
    name:'resolove_date_time',
  })
  resolveDateTime: Date | null;

  @Column('bigint', {
    nullable: false,
    name:'status_resolve_id',
  })
  statusResolveId: string;

  @Column('bigint', {
    nullable: false,
    name:'employee_id',
  })
  employeeId: string;

  @Column('bigint', {
    nullable: false,
    name:'branch_id',
  })
  branchId: string;

  @Column('bigint', {
    nullable: false,
    name:'user_id_created',
  })
  userIdCreated: string;

  @Column('timestamp without time zone', {
    nullable: false,
    name:'created_time',
  })
  createdTime: Date;

  @Column('bigint', {
    nullable: false,
    name:'user_id_updated',
  })
  userIdUpdated: string;

  @Column('timestamp without time zone', {
    nullable: false,
    name:'updated_time',
  })
  updatedTime: Date;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name:'is_deleted',
  })
  isDeleted: boolean | null;
}
