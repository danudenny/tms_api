import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { CodVoucherDetail } from './cod-voucher-detail';

@Entity('cod_voucher', { schema: 'public' })
export class CodVoucher extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'cod_voucher_id',
  })
  codVoucherId: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'cod_voucher_no',
  })
  codVoucherNo: string;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'cod_voucher_date',
  })
  codVoucherDate: Date;

  @Column('character varying', {
    nullable: false,
    length: 100,
    name: 'cod_voucher_service',
  })
  codVoucherService: string;

  @Column('numeric', {
    nullable: true,
    default: () => 0,
    precision: 20,
    scale: 5,
    name: 'amount_transfer',
  })
  amountTransfer: number | null;

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

  @OneToMany(() => CodVoucherDetail, x => x.voucherBranch)
  details: CodVoucherDetail[];
}
