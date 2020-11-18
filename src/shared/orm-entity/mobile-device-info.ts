import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from 'typeorm';
import { TmsBaseEntity } from './tms-base';
import {User} from './user';

@Entity('mobile_device_info', {schema: 'public'})
export class MobileDeviceInfo extends TmsBaseEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'mobile_device_info_id',
  })
  mobileDeviceInfoId: string;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'imei',
  })
  imei: string;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'manufacture',
  })
  manufacture: string;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'brand',
  })
  brand: string;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'product',
  })
  product: string;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'model',
  })
  model: string;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'token',
  })
  token: string;

  @Column('character varying', {
    nullable: true,
    length: 10,
    name: 'version',
  })
  version: string;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'date_time',
  })
  dateTime: Date;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_deleted',
  })
  isDeleted: boolean;

  @Column('bigint', {
    nullable: false,
    name: 'user_id',
  })
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
