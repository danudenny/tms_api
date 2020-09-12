import { Column, Entity, Index, PrimaryGeneratedColumn, OneToMany, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { TmsBaseEntity } from './tms-base';
import {ReceivedBag} from './received-bag';

@Entity('received_bag_detail', { schema: 'public' })
export class ReceivedBagDetail extends TmsBaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'received_bag_detail_id',
  })
  receivedBagDetailId: number;

  @Column('bigint', {
    nullable: false,
    name: 'received_bag_id',
  })
  receivedBagId: number;

  @Column('character varying', {
    nullable: false,
    length: 100,
    name: 'bag_number',
  })
  bagNumber: string;

  @Column('character varying', {
    nullable: false,
    length: 100,
    name: 'scanned_bag_number',
  })
  scannedBagNumber: string;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 5,
    name: 'bag_weight',
  })
  bagWeight: number;

  @Column('bigint', {
    nullable: false,
    name: 'user_id_created',
  })
  userIdCreated: number;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'created_time',
  })
  createdTime: Date;

  @Column('bigint', {
    nullable: false,
    name: 'user_id_updated',
  })
  userIdUpdated: number;

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

  @ManyToOne(() => ReceivedBag)
  @JoinColumn({ name: 'received_bag_id', referencedColumnName: 'receivedBagId' })
  receivedBag: ReceivedBag;
}
