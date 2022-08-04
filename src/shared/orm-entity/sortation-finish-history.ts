import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { DoSortation } from './do-sortation';
import { TmsBaseEntity } from './tms-base';
import { User } from './user';
@Entity('sortation_finish_history', { schema: 'public' })

export class SortationFinishHistory extends TmsBaseEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'sortation_finish_history_id',
  })
  sortationFinishHistoryId: string;

  @Column({
    nullable: false,
    type: 'uuid',
    name: 'do_sortation_id',
  })
  doSortationId: string;

  @OneToOne(() => DoSortation)
  @JoinColumn({ name: 'do_sortation_id' })
  doSortation: DoSortation;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id_updated' })
  admin: User;
}
