import { Column, Entity } from 'typeorm';
import { TmsBaseEntity } from './tms-base';

@Entity('awb_status', { schema: 'public' })
export class AwbStatus extends TmsBaseEntity {
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

  @Column('boolean', {
    nullable: true,
    default: () => 'false',
    name: 'is_cod',
  })
  isCod: boolean | null;
}
