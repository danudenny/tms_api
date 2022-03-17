import { Column, Entity, PrimaryGeneratedColumn,OneToOne, JoinColumn } from 'typeorm';
import { TmsBaseEntity } from './tms-base';
import { Branch } from './branch';
import { User } from './user';
import { Employee } from './employee';

@Entity('awb_return_cancel', { schema: 'public' })
export class AwbReturnCancel extends TmsBaseEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'id',
  })
  id: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'awb_number',
  })
  awbNumber: string;

  @Column('bigint', {
    nullable: false,
    name: 'awb_item_id',
  })
  awbItemId: number;

  @Column('bigint', {
    nullable: true,
    name: 'branch_id',
  })
  branchId: number | null;

  @Column('text', {
    nullable: true,
    name: 'notes',
  })
  notes: string | null;

  // relation model
  @OneToOne(() => Branch, branch => branch, {
    eager: false,
    nullable: true,
  })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id_created' })
  user: User;
}
