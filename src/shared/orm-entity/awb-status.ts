import { BaseEntity, Column, Entity, OneToOne, JoinColumn } from 'typeorm';
import { RolePodManualStatus } from '../orm-entity/role-pod-manual-status'


@Entity('awb_status', { schema: 'public' })
export class AwbStatus extends BaseEntity {
  @Column('integer', {
    nullable: false,
    primary: true,
    name: 'awb_status_id',
  })
  awbStatusId: number;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'awb_status_name',
  })
  awbStatusName: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'awb_status_title',
  })
  awbStatusTitle: string;

  @Column('integer', {
    nullable: false,
    name: 'awb_visibility',
  })
  awbVisibility: number;

  @Column('integer', {
    nullable: false,
    name: 'awb_level',
  })
  awbLevel: number;

  @Column('text', {
    nullable: true,
    name: 'awb_desc',
  })
  awbDesc: string | null;

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

  @Column('boolean', {
    nullable: true,
    default: () => 'false',
    name: 'is_final_status',
  })
  isFinalStatus: boolean | null;

  @Column('boolean', {
    nullable: true,
    default: () => 'false',
    name: 'is_attempted',
  })
  isAttempted: boolean | null;

  @Column('boolean', {
    nullable: true,
    default: () => 'false',
    name: 'is_problem',
  })
  isProblem: boolean | null;

  @Column('boolean', {
    nullable: true,
    default: () => 'false',
    name: 'is_return',
  })
  isReturn: boolean | null;

}
