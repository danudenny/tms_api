import { Column, Entity, PrimaryGeneratedColumn, JoinColumn, OneToOne } from 'typeorm';

import { TmsBaseEntity } from './tms-base';
import { Awb } from './awb';
import { Customer } from './customer';

@Entity('awb_return', { schema: 'public' })
export class AwbReturn extends TmsBaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'awb_return_id',
  })
  awbReturnId: number;

  @Column('bigint', {
    nullable: false,
    name: 'origin_awb_id',
  })
  originAwbId: number;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'origin_awb_number',
  })
  originAwbNumber: string;

  @Column('bigint', {
    nullable: false,
    name: 'return_awb_id',
  })
  returnAwbId: number;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'return_awb_number',
  })
  returnAwbNumber: string;

  @Column('boolean', {
    nullable: true,
    default: () => 'false',
    name: 'is_partner_logistic',
  })
  isPartnerLogistic: boolean;

  @Column('bigint', {
    nullable: false,
    name: 'branch_id',
  })
  branchId: number;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'partner_logistic_name',
  })
  partnerLogisticName: string;

  @OneToOne(() => Awb)
  @JoinColumn({ name: 'origin_awb_id' })
  originAwb: Awb;

}
