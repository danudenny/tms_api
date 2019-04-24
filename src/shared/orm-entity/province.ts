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

  })
  province_id: string;

  @Column('bigint', {
    nullable: false,

  })
  country_id: string;

  @Column('character varying', {
    nullable: false,
    length: 255,

  })
  province_code: string;

  @Column('character varying', {
    nullable: false,
    length: 255,

  })
  province_name: string;

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
