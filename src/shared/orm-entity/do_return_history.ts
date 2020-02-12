import { Column, Entity, PrimaryGeneratedColumn, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { TmsBaseEntity } from './tms-base';
import { DoReturnMaster } from './do_return_master';
import { User } from './user';
import { DoReturnAwb } from './do_return_awb';

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
    name: 'user_id_created',
  })
  userIdCreated: number;

  @Column('bigint', {
    nullable: true,
    name: 'do_return_master_id',
  })
  doReturnMasterId: number;

  @ManyToOne(() => DoReturnMaster)
  @JoinColumn({ name: 'do_return_master_id' })
  doReturnMaster: DoReturnMaster;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id_driver' })
  user: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id_created' })
  userAdmin: User;

  @OneToMany(() => DoReturnAwb, e => e.doReturnHistory)
  doReturnAwbs: DoReturnAwb[];
}
