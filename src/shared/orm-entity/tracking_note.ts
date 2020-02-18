import { Column, Entity, PrimaryGeneratedColumn, JoinColumn, ManyToOne } from 'typeorm';
import { TmsBaseEntity } from './tms-base';
import { DoReturnAwb } from './do_return_awb';

@Entity('tracking_note', { schema: 'public' })
export class TrackingNote extends TmsBaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'id',
  })
  id: number;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'receiptnumber',
  })
  receiptNumber: string;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'trackingdatetime',
  })
  trackingDatetime: string;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'noteinternal',
  })
  noteInternal: string;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'notepublic',
  })
  notePublic: string;

  @Column('bigint', {
    nullable: false,
    name: 'trackingsiteid',
  })
  trackingSiteId: number;

  @Column('character varying', {
    nullable: true,
    length: 50,
    name: 'sitecode',
  })
  siteCode: string;

  @Column('character varying', {
    nullable: true,
    length: 50,
    name: 'sitecoderds',
  })
  siteCodeRds: string;

  @Column('character varying', {
    nullable: true,
    length: 50,
    name: 'trackingtype',
  })
  trackingType: string;

  @Column('bigint', {
    nullable: true,
    name: 'ismanifested',
  })
  ismanifested: number | null;

  @Column('character varying', {
    nullable: true,
    length: 1,
    name: 'ispublic',
  })
  isPublic: string;

  @Column('character varying', {
    nullable: true,
    length: 50,
    name: 'receivername',
  })
  receiverName: string;

  @Column('character varying', {
    nullable: true,
    length: 50,
    name: 'couriername',
  })
  courierName: string;

  @Column('bigint', {
    nullable: true,
    name: 'courierid',
  })
  courierId: number | null;

  @ManyToOne(() => DoReturnAwb)
  @JoinColumn({ name: 'receiptnumber', referencedColumnName: 'awbNumber' })
  doReturnAwb: DoReturnAwb;

}
