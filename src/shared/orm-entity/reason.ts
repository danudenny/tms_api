import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { TmsBaseEntity } from './tms-base';

@Entity('reason', { schema: 'public' })
export class Reason extends TmsBaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'reason_id',
  })
  reasonId: number;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'apps_code',
  })
  appsCode: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'reason_category',
  })
  reasonCategory: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'reason_type',
  })
  reasonType: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'reason_code',
  })
  reasonCode: string;

  @Column('character varying', {
    nullable: true,
    length: 500,
    name: 'reason_name',
  })
  reasonName: string | null;

  @Column('text', {
    nullable: true,
    name: 'reason_description',
  })
  reasonDescription: string | null;

  @Column('boolean', {
    nullable: true,
    default: () => 'true',
    name: 'is_reschedule_pickup',
  })
  isReschedulePickup: boolean | null;

  @Column('boolean', {
    nullable: true,
    default: () => 'true',
    name: 'is_reschedule',
  })
  isReschedule: boolean | null;
}
