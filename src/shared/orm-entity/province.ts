import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import { PackagePrice } from './package-price';
import { PackagePriceSpecial } from './package-price-special';

@Entity('province', { schema: 'public' })
export class Province extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'province_id',
  })
  provinceId: string;

  @Column('bigint', {
    nullable: false,
    name: 'country_id',
  })
  countryId: string;

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

  @OneToMany(
    type => PackagePrice,
    package_price => package_price.provinceIdFrom,
  )
  packagePrices: PackagePrice[];

  @OneToMany(type => PackagePrice, package_price => package_price.provinceIdTo)
  packagePrices2: PackagePrice[];

  @OneToMany(
    type => PackagePriceSpecial,
    package_price_special => package_price_special.provinceIdFrom,
  )
  packagePriceSpecials: PackagePriceSpecial[];

  @OneToMany(
    type => PackagePriceSpecial,
    package_price_special => package_price_special.provinceIdTo,
  )
  packagePriceSpecials2: PackagePriceSpecial[];
}
