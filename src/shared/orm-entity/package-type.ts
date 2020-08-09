import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PackagePrice } from './package-price';
import { PackagePriceSpecial } from './package-price-special';
import { TmsBaseEntity } from './tms-base';

// TODO: change name field to camel case
@Entity('package_type', { schema: 'public' })
export class PackageType extends TmsBaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'package_type_id',
  })
  packageTypeId: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'package_type_code',
  })
  packageTypeCode: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'package_type_name',
  })
  packageTypeName: string;

  @Column('numeric', {
    nullable: false,
    precision: 10,
    scale: 5,
    name: 'min_weight',
  })
  minWeight: string;

  @Column('numeric', {
    nullable: false,
    precision: 10,
    scale: 5,
    name: 'weight_rounding_const',
  })
  weightRoundingConst: string;

  @Column('numeric', {
    nullable: false,
    precision: 10,
    scale: 5,
    name: 'weight_rounding_up_global',
  })
  weightRoundingUpGlobal: string;

  @Column('numeric', {
    nullable: false,
    precision: 10,
    scale: 5,
    name: 'weight_rounding_up_detail',
  })
  weightRoundingUpDetail: string;

  @Column('numeric', {
    nullable: false,
    precision: 10,
    scale: 5,
    name: 'divider_volume',
  })
  dividerVolume: string;

  @Column('numeric', {
    nullable: false,
    precision: 10,
    scale: 5,
    name: 'lead_time_min_days',
  })
  leadTimeMinDays: string;

  @Column('numeric', {
    nullable: false,
    precision: 10,
    scale: 5,
    name: 'lead_time_max_days',
  })
  leadTimeMaxDays: string;

  @Column('boolean', {
    nullable: true,
    default: () => 'false',
    name: 'weight_rounding_up_global_bool',
  })
  weightRoundingUpGlobalBool: boolean | null;

  @Column('boolean', {
    nullable: true,
    default: () => 'false',
    name: 'weight_rounding_up_detail_bool',
  })
  weightRoundingUpDetailBool: boolean | null;

  @OneToMany(() => PackagePrice, package_price => package_price.packageType)
  packagePrices: PackagePrice[];

  @OneToMany(
    () => PackagePriceSpecial,
    package_price_special => package_price_special.packageType,
  )
  packagePriceSpecials: PackagePriceSpecial[];
}
