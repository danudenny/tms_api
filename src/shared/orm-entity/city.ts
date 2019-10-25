import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { PackagePrice } from './package-price';
import { PackagePriceSpecial } from './package-price-special';
import { TmsBaseEntity } from './tms-base';

@Entity('city', { schema: 'public' })
export class City extends TmsBaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'city_id',
  })
  cityId: number;

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
  countryId: number;

  @Column('bigint', {
    nullable: false,
    name: 'province_id',
  })
  provinceId: number;

  @Column('bigint', {
    nullable: true,
    name: 'city_id_ref_price',
  })
  cityIdRefPrice: number | null;

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

  @OneToMany(() => PackagePrice, package_price => package_price.cityIdFrom)
  packagePrices: PackagePrice[];

  @OneToMany(() => PackagePrice, package_price => package_price.cityIdTo)
  packagePrices2: PackagePrice[];

  @OneToMany(
    () => PackagePriceSpecial,
    package_price_special => package_price_special.cityIdFrom,
  )
  packagePriceSpecials: PackagePriceSpecial[];

  @OneToMany(
    () => PackagePriceSpecial,
    package_price_special => package_price_special.cityIdTo,
  )
  packagePriceSpecials2: PackagePriceSpecial[];
}
