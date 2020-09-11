import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';

import { TmsBaseEntity } from './tms-base';
import { User } from './user';

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

  // User Created == User Driver
  @ManyToOne(() => User)
  @JoinColumn({
    name: 'user_id_created',
  })
  userCreated: User;
}
