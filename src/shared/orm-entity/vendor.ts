import { Column, Entity, Index, PrimaryGeneratedColumn, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { TmsBaseEntity } from './tms-base';

@Entity('vendor', { schema: 'public' })
export class Vendor extends TmsBaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'vendor_id',
  })
  vendorId: number;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'vendor_name',
  })
  vendorName: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'vendor_code',
  })
  vendorCode: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'address',
  })
  address: Date;

  @Column('bigint', {
    nullable: false,
    name: 'min_charge',
  })
  minCharge: number;

  @Column('bigint', {
    nullable: false,
    name: 'price',
  })
  price: number;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'note',
  })
  note: Date;

  @Column('bigint', {
    nullable: false,
    name: 'sla_start',
  })
  slaStart: number;

  @Column('bigint', {
    nullable: false,
    name: 'sla_end',
  })
  slaEnd: number;

  @Column('bigint', {
    nullable: false,
    name: 'user_id_updated',
  })
  userIdUpdated: number;

  @Column('bigint', {
    nullable: false,
    name: 'user_id_created',
  })
  userIdCreated: number;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'updated_time',
  })
  updatedTime: Date;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'created_time',
  })
  createdTime: Date;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_deleted',
  })
  isDeleted: boolean;
}
