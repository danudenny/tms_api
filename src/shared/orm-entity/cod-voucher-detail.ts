import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
  OneToOne,
} from 'typeorm';
import { CodVoucher } from './cod-voucher';
import { CodTransactionDetail } from './cod-transaction-detail';

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

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_deleted',
  })
  isDeleted: boolean;

  @ManyToOne(() => CodVoucher, x => x.details)
  @JoinColumn({
    name: 'cod_voucher_id',
    referencedColumnName: 'codVoucherId',
  })
  voucherBranch: CodVoucher;

  @OneToOne(() => CodTransactionDetail)
  @JoinColumn({ name: 'awb_number', referencedColumnName: 'awbNumber'})
  codTransactionDetail: CodTransactionDetail;
}
