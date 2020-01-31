import { Column, Entity, PrimaryGeneratedColumn, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { TmsBaseEntity } from './tms-base';
import { DoReturnAwb } from './do_return_awb';
import { User } from './user';

@Entity('do_return_collection_to_cust', { schema: 'public' })
export class DoReturnCollectionToCust extends TmsBaseEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'do_return_collection_to_cust_id',
  })
  doReturnCollectionToCustId: string;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'do_return_collection_to_cust',
  })
  doReturnCollectionToCust: string;

  @Column('bigint', {
    nullable: true,
    name: 'count_awb',
  })
  countAwb: number;

  @OneToMany(() => DoReturnAwb, e => e.doReturnCollectionToCustId)
  doReturnAwbs: DoReturnAwb[];

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id_created' })
  user: User;

}
