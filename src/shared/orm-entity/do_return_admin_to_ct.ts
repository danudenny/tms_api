import { Column, Entity, PrimaryGeneratedColumn, OneToMany, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { TmsBaseEntity } from './tms-base';
import { AttachmentTms } from './attachment-tms';
import { PartnerLogistic } from './partner-logistic';
import { Branch } from './branch';
import { DoReturnAwb } from './do_return_awb';
import { User } from './user';

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
    name: 'count_awb',
  })
  countAwb: number;

  @Column('bigint', {
    nullable: true,
    name: 'attachment_id',
  })
  attachmentId: number;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_partner_logistic',
  })
  isPartnerLogistic: boolean;

  @Column('uuid', {
    nullable: true,
    name: 'partner_logistic_id',
  })
  partnerLogisticId: string;

  @Column('bigint', {
    nullable: true,
    name: 'branch_id',
  })
  branchId: number;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'awb_number_new',
  })
  awbNumberNew: string;

  @OneToOne(() => AttachmentTms)
  @JoinColumn({ name: 'attachment_id' })
  attDetail: AttachmentTms;

  @ManyToOne(() => PartnerLogistic)
  @JoinColumn({ name: 'partner_logistic_id' })
  partnerLogistic: PartnerLogistic;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @OneToMany(() => DoReturnAwb, e => e.doReturnAdmin)
  doReturnAwbs: DoReturnAwb[];

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id_created' })
  user: User;

}
