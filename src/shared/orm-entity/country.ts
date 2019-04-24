import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { PackagePrice } from './package-price';
import { PackagePriceSpecial } from './package-price-special';

@Entity('country', { schema: 'public' })
export class Country extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  country_id: string;

  @Column('character varying', {
    nullable: false,
    length: 255,

  })
  country_code: string;

  @Column('character varying', {
    nullable: false,
    length: 255,

  })
  country_name: string;

  @Column('bigint', {
    nullable: false,

  })
  user_id_created: string;

  @Column('character varying', {
    nullable: false,

  })
  created_time: string;

  @Column('bigint', {
    nullable: false,

  })
  user_id_updated: string;

  @Column('character varying', {
    nullable: false,

  })
  updated_time: string;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',

  })
  is_deleted: boolean;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  country_phone_code: string | null;

  @OneToMany(type => PackagePrice, package_price => package_price.countryIdFrom)
  packagePrices: PackagePrice[];

  @OneToMany(type => PackagePrice, package_price => package_price.countryIdTo)
  packagePrices2: PackagePrice[];

  @OneToMany(
    type => PackagePriceSpecial,
    package_price_special => package_price_special.countryIdFrom,
  )
  packagePriceSpecials: PackagePriceSpecial[];

  @OneToMany(
    type => PackagePriceSpecial,
    package_price_special => package_price_special.countryIdTo,
  )
  packagePriceSpecials2: PackagePriceSpecial[];
}
