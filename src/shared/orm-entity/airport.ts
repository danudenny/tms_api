import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('airport', { schema: 'public' })
export class Airport extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'airport_id',
  })
  airportId: string;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'airport_code',
  })
  airportCode: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'airport_name',
  })
  airportName: string | null;

  @Column('bigint', {
    nullable: false,
    name: 'city_id',
  })
  cityId: string;

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
    nullable: false,
    default: () => '0',
    name: 'representative_id',
  })
  representativeId: string;
}
