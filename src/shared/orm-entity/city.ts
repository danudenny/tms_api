import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { PackagePrice } from './package-price';
import { PackagePriceSpecial } from './package-price-special';

@Entity('city', { schema: 'public' })
export class City extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'city_id',
  })
  cityId: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'city_type',
  })
  cityType: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'city_code',
  })
  cityCode: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'city_name',
  })
  cityName: string;

  @Column('bigint', {
    nullable: false,
    name: 'country_id',
  })
  countryId: string;

  @Column('bigint', {
    nullable: false,
    name: 'province_id',
  })
  provinceId: string;

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

  @Column('bigint', {
    nullable: true,
    name: 'city_id_ref_price',
  })
  cityIdRefPrice: string | null;

  @Column('boolean', {
    nullable: true,
    default: () => 'false',
    name: 'city_root',
  })
  cityRoot: boolean | null;

  @Column('character varying', {
    nullable: true,
    length: 50,
    name: 'city_code_backup',
  })
  cityCodeBackup: string | null;

  @OneToMany(type => PackagePrice, package_price => package_price.cityIdFrom)
  packagePrices: PackagePrice[];

  @OneToMany(type => PackagePrice, package_price => package_price.cityIdTo)
  packagePrices2: PackagePrice[];

  @OneToMany(
    type => PackagePriceSpecial,
    package_price_special => package_price_special.cityIdFrom,
  )
  packagePriceSpecials: PackagePriceSpecial[];

  @OneToMany(
    type => PackagePriceSpecial,
    package_price_special => package_price_special.cityIdTo,
  )
  packagePriceSpecials2: PackagePriceSpecial[];
}
