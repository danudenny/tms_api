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
import { Place } from './place';

@Entity('place_type', { schema: 'public' })
export class PlaceType extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  place_type_id: string;

  @Column('character varying', {
    nullable: false,
    length: 255,

  })
  place_type_code: string;

  @Column('character varying', {
    nullable: false,
    length: 255,

  })
  place_type_name: string;

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

  @OneToMany(type => Place, place => place.placeType)
  places: Place[];
}
