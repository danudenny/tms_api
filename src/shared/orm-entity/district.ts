import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { PackagePrice } from './package-price';
import { PackagePriceSpecial } from './package-price-special';
import { Place } from './place';

@Entity('district', { schema: 'public' })
export class District extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'district_id',
  })
  districtId: string;

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
    name: 'city_id',
  })
  cityId: string;

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
  zoneId: string;

  @Column('bigint', {
    nullable: true,
    name: 'district_id_ref_price',
  })
  districtIdRefPrice: string | null;

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
    name: 'branch_id_delivery',
  })
  branchIdDelivery: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'branch_id_pickup',
  })
  branchIdPickup: string | null;

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
