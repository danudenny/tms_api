import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TmsBaseEntity } from './tms-base';

@Entity('cod_payment_revision', { schema: 'public' })
export class CodPaymentRevision extends TmsBaseEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'cod_payment_revision_id',
  })
  codPaymentRevisionId: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'awb_number',
  })
  awbNumber: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'note',
  })
  note: string;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_deleted',
  })
  isDeleted: boolean;
}
