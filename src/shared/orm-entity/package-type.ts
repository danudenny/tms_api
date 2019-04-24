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

@Entity('package_type', { schema: 'public' })
export class PackageType extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  package_type_id: string;

  @Column('character varying', {
    nullable: false,
    length: 255,

  })
  package_type_code: string;

  @Column('character varying', {
    nullable: false,
    length: 255,

  })
  package_type_name: string;

  @Column('numeric', {
    nullable: false,
    precision: 10,
    scale: 5,

  })
  min_weight: string;

  @Column('numeric', {
    nullable: false,
    precision: 10,
    scale: 5,

  })
  weight_rounding_const: string;

  @Column('numeric', {
    nullable: false,
    precision: 10,
    scale: 5,

  })
  weight_rounding_up_global: string;

  @Column('numeric', {
    nullable: false,
    precision: 10,
    scale: 5,

  })
  weight_rounding_up_detail: string;

  @Column('numeric', {
    nullable: false,
    precision: 10,
    scale: 5,

  })
  divider_volume: string;

  @Column('numeric', {
    nullable: false,
    precision: 10,
    scale: 5,

  })
  lead_time_min_days: string;

  @Column('numeric', {
    nullable: false,
    precision: 10,
    scale: 5,

  })
  lead_time_max_days: string;

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

  @Column('boolean', {
    nullable: true,
    default: () => 'false',

  })
  weight_rounding_up_global_bool: boolean | null;

  @Column('boolean', {
    nullable: true,
    default: () => 'false',

  })
  weight_rounding_up_detail_bool: boolean | null;

  @OneToMany(type => PackagePrice, package_price => package_price.packageType)
  packagePrices: PackagePrice[];

  @OneToMany(
    type => PackagePriceSpecial,
    package_price_special => package_price_special.packageType,
  )
  packagePriceSpecials: PackagePriceSpecial[];
}
