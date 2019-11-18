import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { PackagePrice } from './package-price';
import { PackagePriceSpecial } from './package-price-special';
import { Place } from './place';
import { TmsBaseEntity } from './tms-base';

@Entity('district', { schema: 'public' })
export class District extends TmsBaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'district_id',
  })
  districtId: number;

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
    nullable: false,
    name: 'city_id',
  })
  cityId: number;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'district_code',
  })
  districtCode: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'district_name',
  })
  districtName: string;

  @Column('bigint', {
    nullable: false,
    name: 'zone_id',
  })
  zoneId: number;

  @Column('bigint', {
    nullable: true,
    name: 'district_id_ref_price',
  })
  districtIdRefPrice: number | null;

  @Column('text', {
    nullable: true,
  })
  notes: string | null;

  @Column('character varying', {
    nullable: false,
    length: 20,
    default: () => '0',
    name: 'zip_code',
  })
  zipCode: string;

  @Column('bigint', {
    nullable: true,
    name: 'branch_id_delivery',
  })
  branchIdDelivery: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'branch_id_pickup',
  })
  branchIdPickup: number | null;

  @OneToMany(
    () => PackagePrice,
    package_price => package_price.districtIdFrom,
  )
  packagePrices: PackagePrice[];

  @OneToMany(() => PackagePrice, package_price => package_price.districtIdTo)
  packagePrices2: PackagePrice[];

  @OneToMany(
    () => PackagePriceSpecial,
    package_price_special => package_price_special.districtIdFrom,
  )
  packagePriceSpecials: PackagePriceSpecial[];

  @OneToMany(
    () => PackagePriceSpecial,
    package_price_special => package_price_special.districtIdTo,
  )
  packagePriceSpecials2: PackagePriceSpecial[];

  @OneToMany(() => Place, place => place.district)
  places: Place[];
}
