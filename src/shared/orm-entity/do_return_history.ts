import { Column, Entity, PrimaryGeneratedColumn, JoinColumn, ManyToOne } from 'typeorm';
import { TmsBaseEntity } from './tms-base';
import { DoReturnMaster } from './do_return_master';

@Entity('do_return_history', { schema: 'public' })
export class DoReturnHistory extends TmsBaseEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'do_return_history_id',
  })
  doReturnHistoryId: string;

  @Column('uuid', {
    nullable: true,
    name: 'do_return_awb_id',
  })
  doReturnAwbId: string;

  @Column('bigint', {
    nullable: true,
    name: 'user_id_driver',
  })
  userIdDriver: number;

  @Column('bigint', {
    nullable: true,
    name: 'do_return_master_id',
  })
  doReturnMasterId: number;

  @ManyToOne(() => DoReturnMaster)
  @JoinColumn({ name: 'do_return_master_id' })
  doReturnMaster: DoReturnMaster;
}
