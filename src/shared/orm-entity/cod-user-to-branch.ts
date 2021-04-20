import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne, OneToOne,
} from 'typeorm';

import { User } from './user';
import { TmsBaseEntity } from './tms-base';
import { Branch } from './branch';
import { AwbItemAttr } from './awb-item-attr';

@Entity('cod_user_to_branch', { schema: 'public' })
export class CodUserToBranch extends TmsBaseEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'cod_user_to_branch_id',
  })
  codUserToBranchId: string;

  @Column('bigint', {
    nullable: false,
    name: 'user_id',
  })
  userId: number;

  @Column('bigint', {
    nullable: false,
    name: 'branch_id',
  })
  branchId: number;

  @ManyToOne(() => User, e => e.userRoles)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToOne(() => AwbItemAttr)
  @JoinColumn({ name: 'branch_id', referencedColumnName: 'branchIdLast' })
  awbItemAttr: AwbItemAttr;

  @OneToOne(() => Branch)
  @JoinColumn({ name: 'branch_id', referencedColumnName: 'branchId' })
  branch: Branch;
}
