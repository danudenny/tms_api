import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { PackagePrice } from './package-price';
import { PackagePriceSpecial } from './package-price-special';
import { Place } from './place';

@Entity('district', { schema: 'public' })
export class District extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  district_id: string;

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
  city_id: string;

  @Column('character varying', {
    nullable: false,
    length: 255,

  })
  district_code: string;

  @Column('character varying', {
    nullable: false,
    length: 255,

  })
  district_name: string;

  @Column('bigint', {
    nullable: false,

  })
  zone_id: string;

  @Column('bigint', {
    nullable: true,

  })
  district_id_ref_price: string | null;

  @Column('text', {
    nullable: true,

  })
  notes: string | null;

  @Column('character varying', {
    nullable: false,
    length: 20,
    default: () => '0',

  })
  zip_code: string;

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
  branch_id_delivery: string | null;

  @Column('bigint', {
    nullable: true,

  })
  branch_id_pickup: string | null;

  @OneToMany(
    type => PackagePrice,
    package_price => package_price.districtIdFrom,
  )
  packagePrices: PackagePrice[];

  @OneToMany(type => PackagePrice, package_price => package_price.districtIdTo)
  packagePrices2: PackagePrice[];

  @OneToMany(
    type => PackagePriceSpecial,
    package_price_special => package_price_special.districtIdFrom,
  )
  packagePriceSpecials: PackagePriceSpecial[];

  @OneToMany(
    type => PackagePriceSpecial,
    package_price_special => package_price_special.districtIdTo,
  )
  packagePriceSpecials2: PackagePriceSpecial[];

  @OneToMany(type => Place, place => place.district)
  places: Place[];
}
