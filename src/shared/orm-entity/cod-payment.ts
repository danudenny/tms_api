import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToOne } from 'typeorm';

import { TmsBaseEntity } from './tms-base';
import { User } from './user';
import { Branch } from './branch';
import { CodUserToBranch } from './cod-user-to-branch';

@Entity('cod_payment', { schema: 'public' })
export class CodPayment extends TmsBaseEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'cod_payment_id',
  })
  codPaymentId: string;

  @Column('character varying', {
    name: 'do_pod_deliver_detail_id',
  })
  doPodDeliverDetailId: string;

  @Column('character varying', {
    nullable: true,
    length: 100,
    name: 'awb_number',
  })
  awbNumber: string;

  @Column('bigint', {
    nullable: true,
    name: 'cod_value',
  })
  codValue: number | null;

  @Column('character varying', {
    nullable: true,
    length: 100,
    name: 'cod_payment_method',
  })
  codPaymentMethod: string | null;

  @Column('character varying', {
    nullable: true,
    length: 100,
    name: 'note',
  })
  note: string | null;

  @Column('character varying', {
    nullable: true,
    length: 100,
    name: 'cod_payment_service',
  })
  codPaymentService: string | null;

  @Column('character varying', {
    nullable: true,
    length: 100,
    name: 'no_reference',
  })
  noReference: string | null;

  // new field
  @Column('bigint', {
    nullable: true,
    name: 'awb_item_id',
  })
  awbItemId: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'user_id_driver',
  })
  userIdDriver: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'branch_id',
  })
  branchId: number | null;

  // User Driver
  @ManyToOne(() => User)
  @JoinColumn({
    name: 'user_id_driver',
  })
  userDriver: User;

  @OneToOne(() => Branch)
  @JoinColumn({ name: 'branch_id' })
  branchFinal: Branch;

  @OneToOne(() => CodUserToBranch)
  @JoinColumn({ name: 'branch_id', referencedColumnName: 'branchId' })
  codUserToBranch: CodUserToBranch;
}
