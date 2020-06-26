import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TmsBaseEntity } from './tms-base';

@Entity('cod_transaction_branch_detail', { schema: 'public' })
export class CodTransactionBranchDetail extends TmsBaseEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'cod_transaction_branch_detail_id',
  })
  codTransactionBranchDetailId: string;

  @Column('character varying', {
    nullable: false,
    length: 100,
    name: 'cod_transaction_branch_id',
  })
  codTransactionBranchId: string;

  @Column('bigint', {
    nullable: false,
    name: 'awb_item_id',
  })
  awbItemId: number;

  @Column('character varying', {
    nullable: false,
    length: 100,
    name: 'awb_number',
  })
  awbNumber: string;

  @Column('numeric', {
    nullable: false,
    default: () => 0,
    precision: 20,
    scale: 5,
    name: 'cod_value',
  })
  codValue: number;

  @Column('character varying', {
    nullable: false,
    length: 50,
    name: 'payment_method',
  })
  paymentMethod: string;

  @Column('character varying', {
    nullable: true,
    length: 100,
    name: 'payment_service',
  })
  paymentService: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'no_reference',
  })
  noReference: string | null;

  @Column('character varying', {
    nullable: false,
    length: 50,
    name: 'consignee_name',
  })
  consigneeName: string;

  @Column('bigint', {
    nullable: false,
    name: 'branch_id',
  })
  branchId: number;

  @Column('bigint', {
    nullable: false,
    name: 'partner_id',
  })
  partnerId: number;

  @Column('bigint', {
    nullable: false,
    name: 'user_id_driver',
  })
  userIdDriver: number;
}
