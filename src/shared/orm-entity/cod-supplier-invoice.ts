import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TmsBaseEntity } from './tms-base';
import { TransactionStatus } from './transaction-status';
import { Branch } from './branch';
import { User } from './user';

@Entity('cod_supplier_invoice', { schema: 'public' })
export class CodSupplierInvoice extends TmsBaseEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'cod_supplier_invoice_id',
  })
  codSupplierInvoiceId: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'supplier_invoice_code',
  })
  supplierInvoiceCode: string;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'supplier_invoice_date',
  })
  supplierInvoiceDate: Date;

  @Column('bigint', {
    nullable: false,
    name: 'supplier_invoice_status_id',
  })
  supplierInvoiceStatusId: number;

  @Column('bigint', {
    nullable: false,
    name: 'partner_id',
  })
  partnerId: number;

  @Column('bigint', {
    nullable: false,
    name: 'branch_id',
  })
  branchId: number;

  @ManyToOne(() => TransactionStatus)
  @JoinColumn({ name: 'supplier_invoice_status_id' })
  transactionStatus: TransactionStatus;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id_created' })
  userAdmin: User;
}
