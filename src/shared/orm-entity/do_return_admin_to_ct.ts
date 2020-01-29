import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TmsBaseEntity } from './tms-base';

@Entity('do_return_admin_to_ct', { schema: 'public' })
export class DoReturnAdmintoCt extends TmsBaseEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'do_return_admin_to_ct_id',
  })
  doReturnAdminToCtId: string;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'do_return_admin_to_ct',
  })
  doReturnAdminToCt: string;

  @Column('bigint', {
    nullable: true,
    name: 'count_awb_do_return_admin_to_ct',
  })
  countAwbDoReturnAdminToCt: string;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_partner_logistic',
  })
  isPartnerLogistic: boolean;

  @Column('bigint', {
    nullable: true,
    name: 'partner_logistic_id',
  })
  partnerLogisticId: string;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'awb_number_new',
  })
  awbNumberNew: string;
}
