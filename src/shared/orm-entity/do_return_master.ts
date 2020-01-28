import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TmsBaseEntity } from './tms-base';

@Entity('do_return_master ', { schema: 'public' })
export class DoReturnMaster extends TmsBaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'do_return_master_id',
  })
  doReturnMasterId: number;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'do_return_master_id_code',
  })
  doReturnMasterIdCode: string;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'do_return_description',
  })
  doReturnDescription: string;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
  })
  is_deleted: boolean;

}
