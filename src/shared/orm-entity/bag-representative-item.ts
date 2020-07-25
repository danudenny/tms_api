import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import {BagRepresentative} from './bag-representative';

@Entity('bag_representative_item', { schema: 'public' })
export class BagRepresentativeItem extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'bag_representative_item_id',
  })
  bagRepresentativeItemId: string;

  @Column('bigint', {
    nullable: false,
    name: 'bag_representative_id',
  })
  bagRepresentativeId: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'ref_awb_number',
  })
  refAwbNumber: string;

  @Column('bigint', {
    nullable: true,
    name: 'awb_id',
  })
  awbId: string;

  @Column('bigint', {
    nullable: true,
    name: 'awb_item_id',
  })
  awbItemId: string;

  @Column('numeric', {
    nullable: true,
    precision: 10,
    scale: 5,
    name: 'weight',
  })
  weight: string | null;

  @Column('bigint', {
    nullable: false,
    name: 'representative_id_to',
  })
  representativeIdTo: string;

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

  @ManyToOne(() => BagRepresentative, bagRepresentative => bagRepresentative.bagRepresentativeItems, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'bag_representative_id',
  })
  bagRepresentativeItem: BagRepresentative;
}
