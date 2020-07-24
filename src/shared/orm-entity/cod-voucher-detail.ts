import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { CodVoucher } from './cod-voucher';

@Entity('cod_voucher_detail', { schema: 'public' })
export class CodVoucherDetail extends BaseEntity {
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

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'created_time',
  })
  createdTime: Date;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'updated_time',
  })
  updatedTime: Date;

  @ManyToOne(() => CodVoucher, x => x.details)
  @JoinColumn({
    name: 'cod_voucher_id',
    referencedColumnName: 'codVoucherId',
  })
  voucherBranch: CodVoucher;
}
