import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('location', { schema: 'public' })
export class Location extends BaseEntity {
  @PrimaryColumn('character varying', {
    nullable: false,
    length: 255,
  })
  code: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
  })
  province: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
  })
  city: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
  })
  district: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
  })
  city_code: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
  })
  zone: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
  })
  city_name: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
  })
  toped_code: string;

  @Column('text', {
    nullable: false,
  })
  notes: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
  })
  representative: string;

  @Column('bigint', {
    nullable: true,
  })
  province_id: string | null;

  @Column('bigint', {
    nullable: true,
  })
  zone_id: string | null;

  @Column('bigint', {
    nullable: true,
  })
  city_id: string | null;

  @Column('bigint', {
    nullable: true,
  })
  representative_id: string | null;

  @Column('bigint', {
    nullable: true,
  })
  district_id: string | null;

  @Column('character varying', {
    nullable: true,
    length: 50,
  })
  city_type: string | null;
}
