import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TmsBaseEntity } from './tms-base';

@Entity('awb_trouble', { schema: 'public' })
export class AwbTrouble extends TmsBaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'awb_trouble_id',
  })
  awbTroubleId: number;

  @Column('character varying', {
    nullable: false,
    length: 50,
    name: 'awb_trouble_code',
  })
  awbTroubleCode: string;

  @Column('bigint', {
    nullable: false,
    name: 'awb_trouble_status_id',
  })
  awbTroubleStatusId: number;

  @Column('bigint', {
    nullable: false,
    name: 'awb_status_id',
  })
  awbStatusId: number;

  @Column('character varying', {
    nullable: false,
    length: 50,
    name: 'awb_number',
  })
  awbNumber: string;

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
    name: 'user_id_trigger',
  })
  userIdTrigger: number;

  @Column('bigint', {
    nullable: false,
    name: 'employee_id_trigger',
  })
  employeeIdTrigger: number;

  @Column('bigint', {
    nullable: false,
    name: 'branch_id_trigger',
  })
  branchIdTrigger: number;

  @Column('bigint', {
    nullable: true,
    name: 'user_id_unclear',
  })
  userIdUnclear: number;

  @Column('bigint', {
    nullable: true,
    name: 'employee_id_unclear',
  })
  employeeIdUnclear: number;

  @Column('bigint', {
    nullable: true,
    name: 'branch_id_unclear',
  })
  branchIdUnclear: number;

  @Column('bigint', {
    nullable: true,
    name: 'user_id_pic',
  })
  userIdPic: number;

  @Column('bigint', {
    nullable: true,
    name: 'employee_id_pic',
  })
  employeeIdPic: number;

  @Column('bigint', {
    nullable: true,
    name: 'branch_id_pic',
  })
  branchIdPic: number;

  @Column('text', {
    nullable: true,
    name: 'description_solution',
  })
  descriptionSolution: string | null;

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

  @Column('character varying', {
    nullable: false,
    length: 10,
    name: 'trouble_category',
  })
  troubleCategory: string;

  @Column('text', {
    nullable: true,
    name: 'trouble_desc',
  })
  troubleDesc: string | null;
}
