import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { TmsBaseEntity } from './tms-base';
import { Branch } from './branch';
import { DoReturnAwb } from './do_return_awb';
import { User } from './user';

@Entity('do_return_ct_to_collection', { schema: 'public' })
export class DoReturnCtToCollection extends TmsBaseEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'do_return_ct_to_collection_id',
  })
  doReturnCtToCollectionId: string;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'do_return_ct_to_collection',
  })
  doReturnCtToCollection: string;

  @Column('bigint', {
    nullable: true,
    name: 'count_awb',
  })
  countAwb: number;

  @Column('bigint', {
    nullable: true,
    name: 'branch_id',
  })
  branchId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id_created' })
  user: User;

  @OneToMany(() => DoReturnAwb, e => e.doReturnCt)
  doReturnAwbs: DoReturnAwb[];

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;
}