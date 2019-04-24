import { BaseEntity, Column, Entity } from 'typeorm';

@Entity('awb_status', { schema: 'public' })
export class AwbStatus extends BaseEntity {
  @Column('integer', {
    nullable: false,
    primary: true,
  })
  awb_status_id: number;

  @Column('character varying', {
    nullable: false,
    length: 255,
  })
  awb_status_name: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
  })
  awb_status_title: string;

  @Column('integer', {
    nullable: false,
  })
  awb_visibility: number;

  @Column('integer', {
    nullable: false,
  })
  awb_level: number;

  @Column('text', {
    nullable: true,
  })
  awb_desc: string | null;

  @Column('bigint', {
    nullable: false,
  })
  user_id_created: string;

  @Column('timestamp without time zone', {
    nullable: false,
  })
  created_time: Date;

  @Column('bigint', {
    nullable: false,
  })
  user_id_updated: string;

  @Column('timestamp without time zone', {
    nullable: false,
  })
  updated_time: Date;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
  })
  is_deleted: boolean;

  @Column('boolean', {
    nullable: true,
    default: () => 'false',
  })
  is_final_status: boolean | null;

  @Column('boolean', {
    nullable: true,
    default: () => 'false',
  })
  is_attempted: boolean | null;

  @Column('boolean', {
    nullable: true,
    default: () => 'false',
  })
  is_problem: boolean | null;
}
