import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Place } from './place';

@Entity('place_type', { schema: 'public' })
export class PlaceType extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'place_type_id',
  })
  placeTypeId: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'place_type_code',
  })
  placeTypeCode: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'place_type_name',
  })
  placeTypeName: string;

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

  @OneToMany(type => Place, place => place.placeType)
  places: Place[];
}
