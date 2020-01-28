import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TmsBaseEntity } from './tms-base';

@Entity('do_return_history ', { schema: 'public' })
export class DoReturnHistory extends TmsBaseEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'do_return_history_id',
  })
  doReturnHistoryId: string;

  @Column('bigint', {
    nullable: true,
    name: 'do_return_awb_id',
  })
  doReturnAwbId: string;

  @Column('bigint', {
    nullable: true,
    name: 'do_return_master_id',
  })
  doReturnMasterId: string;

}
