import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Bank } from './bank';
import { TmsBaseEntity } from './tms-base';

@Entity('bank_branch', { schema: 'public' })
export class BankBranch extends TmsBaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'bank_branch_id',
  })
  bankBranchId: string;

  @Column('bigint', {
    nullable: false,
    name: 'bank_id',
  })
  bankId: string;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'bank_branch_name',
  })
  bankBranchName: string | null;

  @Column('text', {
    nullable: true,
  })
  address: string | null;

  @ManyToOne(() => Bank)
  @JoinColumn({ name: 'bank_id', referencedColumnName: 'bankId' })
  bank: Bank;
}
