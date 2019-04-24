import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { PackagePrice } from './package-price';
import { PackagePriceSpecial } from './package-price-special';

@Entity('city', { schema: 'public' })
export class City extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  city_id: string;

  @Column('character varying', {
    nullable: false,
    length: 255,

  })
  city_type: string;

  @Column('character varying', {
    nullable: false,
    length: 255,

  })
  city_code: string;

  @Column('character varying', {
    nullable: false,
    length: 255,

  })
  city_name: string;

  @Column('bigint', {
    nullable: false,

  })
  country_id: string;

  @Column('bigint', {
    nullable: false,

  })
  province_id: string;

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

  @Column('bigint', {
    nullable: true,

  })
  city_id_ref_price: string | null;

  @Column('boolean', {
    nullable: true,
    default: () => 'false',

  })
  city_root: boolean | null;

  @Column('character varying', {
    nullable: true,
    length: 50,

  })
  city_code_backup: string | null;

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
