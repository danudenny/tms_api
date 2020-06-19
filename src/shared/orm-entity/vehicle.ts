import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { TmsBaseEntity } from './tms-base';
import { truncate } from 'fs';

@Entity('vehicle', { schema: 'public' })
export class Vehicle extends TmsBaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'vehicle_id',
  })
  reasonId: number;

  @Column('bigint', {
    nullable: false,
    name: 'branch_id',
  })
  branchId: number;

  @Column('bigint', {
    nullable: false,
    name: 'city_id',
  })
  cityId: number;

  @Column('character varying', {
    nullable: false,
    length: 10,
    name: 'vehicle_number',
  })
  vehicleNumber: string;

  @Column('bigint', {
    nullable: false,
    name: 'brand_id',
  })
  brandId: number;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'vehicle_name',
  })
  vehicleName: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'vehicle_year',
  })
  vehicleYear: number | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'vehicle_kilometer',
  })
  vehicleKilometer: string | null;

  @Column('bigint', {
    nullable: false,
    name: 'is_active',
  })
  isActive: number;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'additional_notes',
  })
  additionalNotes: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'vehicle_capacity',
  })
  vehicleCapacity: string | null;

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
