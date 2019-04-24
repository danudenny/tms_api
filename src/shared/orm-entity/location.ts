import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('location', { schema: 'public' })
export class Location extends BaseEntity {
  @PrimaryColumn('character varying', {
    nullable: false,
    length: 255,
    name: 'code',
  })
  code: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'province',
  })
  province: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'city',
  })
  city: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'district',
  })
  district: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'city_code',
  })
  cityCode: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'zone',
  })
  zone: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'city_name',
  })
  cityName: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'toped_code',
  })
  topedCode: string;

  @Column('text', {
    nullable: false,
    name: 'notes',
  })
  notes: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'representative',
  })
  representative: string;

  @Column('bigint', {
    nullable: true,
    name: 'province_id',
  })
  provinceId: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'zone_id',
  })
  zoneId: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'city_id',
  })
  cityId: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'representative_id',
  })
  representativeId: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'district_id',
  })
  districtId: string | null;

  @Column('character varying', {
    nullable: true,
    length: 50,
    name: 'city_type',
  })
  cityType: string | null;
}
