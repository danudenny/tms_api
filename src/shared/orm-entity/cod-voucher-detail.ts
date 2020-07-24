import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { TmsBaseEntity } from './tms-base';
import { CodVoucher } from './cod-voucher';
import { ColumnNumericTransformer } from './column-numeric-transformer';

@Entity('cod_voucher_detail', { schema: 'public' })
export class CodVoucherDetail extends TmsBaseEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'cod_voucher_detail_id',
  })
  codVoucherDetailId: string;

  @Column('uuid', {
    nullable: true,
    name: 'cod_voucher_id',
  })
  codVoucherId: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'awb_number',
  })
  awbNumber: string;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_settlement',
  })
  isSettlement: boolean;

  @ManyToOne(() => CodVoucher, x => x.details)
  @JoinColumn({
    name: 'cod_voucher_id',
    referencedColumnName: 'codVoucherId',
  })
  voucherBranch: CodVoucher;
}
