import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PackagePrice } from './package-price';
import { PackagePriceSpecial } from './package-price-special';
import { TmsBaseEntity } from './tms-base';

@Entity('province', { schema: 'public' })
export class Province extends TmsBaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'province_id',
  })
  provinceId: number;

  @Column('bigint', {
    nullable: false,
    name: 'country_id',
  })
  countryId: number;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'province_code',
  })
  provinceCode: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'province_name',
  })
  provinceName: string;

  @OneToMany(() => PackagePrice, package_price => package_price.provinceIdFrom)
  packagePrices: PackagePrice[];

  @OneToMany(() => PackagePrice, package_price => package_price.provinceIdTo)
  packagePrices2: PackagePrice[];

  @OneToMany(
    () => PackagePriceSpecial,
    package_price_special => package_price_special.provinceIdFrom,
  )
  packagePriceSpecials: PackagePriceSpecial[];

  @OneToMany(
    () => PackagePriceSpecial,
    package_price_special => package_price_special.provinceIdTo,
  )
  packagePriceSpecials2: PackagePriceSpecial[];
}
