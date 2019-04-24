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
import { PlaceType } from './place-type';
import { District } from './district';

@Entity('place', { schema: 'public' })
export class Place extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  place_id: string;

  @ManyToOne(type => PlaceType, place_type => place_type.places, {})
  @JoinColumn({ name: 'place_type_id' })
  placeType: PlaceType | null;

  @ManyToOne(type => District, district => district.places, { nullable: false })
  @JoinColumn({ name: 'district_id' })
  district: District | null;

  @Column('character varying', {
    nullable: false,
    length: 255,

  })
  place_code: string;

  @Column('character varying', {
    nullable: false,
    length: 255,

  })
  place_name: string;

  @Column('text', {
    nullable: true,

  })
  address: string | null;

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
}
