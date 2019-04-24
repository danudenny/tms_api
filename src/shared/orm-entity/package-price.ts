import { BaseEntity, Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { City } from './city';
import { Country } from './country';
import { District } from './district';
import { PackageType } from './package-type';
import { Province } from './province';

@Entity('package_price', { schema: 'public' })
@Index(
  'package_price_unique_key11',
  ['cityIdFrom', 'cityIdTo', 'packageType'],
  { unique: true },
)
@Index(
  'package_price_unique_key10',
  ['cityIdFrom', 'packageType', 'provinceIdTo'],
  { unique: true },
)
@Index(
  'package_price_unique_key12',
  ['cityIdFrom', 'districtIdTo', 'packageType'],
  { unique: true },
)
@Index(
  'package_price_unique_key9',
  ['cityIdFrom', 'countryIdTo', 'packageType'],
  { unique: true },
)
@Index(
  'package_price_unique_key15',
  ['cityIdTo', 'districtIdFrom', 'packageType'],
  { unique: true },
)
@Index(
  'package_price_unique_key7',
  ['cityIdTo', 'packageType', 'provinceIdFrom'],
  { unique: true },
)
@Index(
  'package_price_unique_key3',
  ['cityIdTo', 'countryIdFrom', 'packageType'],
  { unique: true },
)
@Index(
  'package_price_unique_key1',
  ['countryIdFrom', 'countryIdTo', 'packageType'],
  { unique: true },
)
@Index(
  'package_price_unique_key2',
  ['countryIdFrom', 'packageType', 'provinceIdTo'],
  { unique: true },
)
@Index(
  'package_price_unique_key4',
  ['countryIdFrom', 'districtIdTo', 'packageType'],
  { unique: true },
)
@Index(
  'package_price_unique_key5',
  ['countryIdTo', 'packageType', 'provinceIdFrom'],
  { unique: true },
)
@Index(
  'package_price_unique_key13',
  ['countryIdTo', 'districtIdFrom', 'packageType'],
  { unique: true },
)
@Index(
  'package_price_unique_key14',
  ['districtIdFrom', 'packageType', 'provinceIdTo'],
  { unique: true },
)
@Index(
  'package_price_unique_key16',
  ['districtIdFrom', 'districtIdTo', 'packageType'],
  { unique: true },
)
@Index(
  'package_price_unique_key8',
  ['districtIdTo', 'packageType', 'provinceIdFrom'],
  { unique: true },
)
@Index('package_price_from_id_idx', ['fromId'])
@Index('package_price_from_type_idx', ['fromType'])
@Index('package_price_package_type_id_idx', ['packageType'])
@Index(
  'package_price_unique_key6',
  ['packageType', 'provinceIdFrom', 'provinceIdTo'],
  { unique: true },
)
@Index('package_price_to_id_idx', ['toId'])
@Index('package_price_to_type_idx', ['toType'])
@Index('package_price_updated_time_idx', ['updatedTime'])
export class PackagePrice extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'package_price_id',
  })
  packagePriceId: string;

  @ManyToOne(type => PackageType, package_type => package_type.packagePrices, {
    nullable: false,
  })
  @JoinColumn({ name: 'package_type_id' })
  packageType: PackageType | null;

  @Column('bigint', {
    nullable: true,
    name: 'branch_id_from',
  })
  branchIdFrom: string | null;

  @ManyToOne(type => Country, country => country.packagePrices, {})
  @JoinColumn({ name: 'country_id_from' })
  countryIdFrom: Country | null;

  @ManyToOne(type => Province, province => province.packagePrices, {})
  @JoinColumn({ name: 'province_id_from' })
  provinceIdFrom: Province | null;

  @ManyToOne(type => City, city => city.packagePrices, {})
  @JoinColumn({ name: 'city_id_from' })
  cityIdFrom: City | null;

  @ManyToOne(type => District, district => district.packagePrices, {})
  @JoinColumn({ name: 'district_id_from' })
  districtIdFrom: District | null;

  @Column('bigint', {
    nullable: true,
    name: 'branch_id_to',
  })
  branchIdTo: string | null;

  @ManyToOne(type => Country, country => country.packagePrices2, {})
  @JoinColumn({ name: 'country_id_to' })
  countryIdTo: Country | null;

  @ManyToOne(type => Province, province => province.packagePrices2, {})
  @JoinColumn({ name: 'province_id_to' })
  provinceIdTo: Province | null;

  @ManyToOne(type => City, city => city.packagePrices2, {})
  @JoinColumn({ name: 'city_id_to' })
  cityIdTo: City | null;

  @ManyToOne(type => District, district => district.packagePrices2, {})
  @JoinColumn({ name: 'district_id_to' })
  districtIdTo: District | null;

  @Column('numeric', {
    nullable: true,
    precision: 10,
    scale: 5,
    name: 'min_weight',
  })
  minWeight: string | null;

  @Column('numeric', {
    nullable: false,
    precision: 20,
    scale: 5,
    name: 'basic_fare',
  })
  basicFare: string;

  @Column('numeric', {
    nullable: false,
    precision: 20,
    scale: 5,
    name: 'next_price',
  })
  nextPrice: string;

  @Column('numeric', {
    nullable: false,
    precision: 10,
    scale: 5,
    name: 'disc_price_percent',
  })
  discPricePercent: string;

  @Column('numeric', {
    nullable: false,
    precision: 20,
    scale: 5,
    name: 'disc_price_value',
  })
  discPriceValue: string;

  @Column('numeric', {
    nullable: true,
    precision: 10,
    scale: 5,
    name: 'divider_volume',
  })
  dividerVolume: string | null;

  @Column('numeric', {
    nullable: true,
    precision: 10,
    scale: 5,
    name: 'lead_time_min_days',
  })
  leadTimeMinDays: string | null;

  @Column('numeric', {
    nullable: true,
    precision: 10,
    scale: 5,
    name: 'lead_time_max_days',
  })
  leadTimeMaxDays: string | null;

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
    name: 'from_type',
  })
  fromType: number | null;

  @Column('integer', {
    nullable: true,
    name: 'to_type',
  })
  toType: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'from_id',
  })
  fromId: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'to_id',
  })
  toId: string | null;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 5,
    name: 'dok1kg',
  })
  dok1kg: string | null;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 5,
    name: 'dok2kg',
  })
  dok2kg: string | null;
}
