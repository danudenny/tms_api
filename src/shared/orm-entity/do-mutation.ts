import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { Branch } from './branch';
import { DoMutationDetail } from './do-mutation-detail';

import { TmsBaseEntity } from './tms-base';

@Entity('do_mutation', { schema: 'public' })
@Index('do_mutation_id', ['doMutationId'])
export class DoMutation extends TmsBaseEntity {
  @PrimaryColumn({
    type: 'uuid',
    name: 'do_mutation_id',
  })
  doMutationId: string;

  @Column('character varying', {
    name: 'do_mutation_code',
    length: 30,
  })
  doMutationCode: string;

  @Column('timestamp without time zone', {
    name: 'do_mutation_date',
  })
  doMutationDate: Date;

  @Column('bigint', {
    nullable: false,
    name: 'branch_id_from',
  })
  branchIdFrom: number;

  @Column('bigint', {
    nullable: false,
    name: 'branch_id_to',
  })
  branchIdTo: number;

  @Column('bigint', {
    nullable: false,
    name: 'total_bag',
  })
  totalBag: number;

  @Column('numeric', {
    precision: 10,
    scale: 5,
    name: 'total_weight',
  })
  totalWeight: number;

  @Column('text', {
    name: 'note',
  })
  note: string;

  @Column('bigint', {
    name: 'user_id_created',
  })
  userIdCreated: number;

  @Column('bigint', {
    name: 'user_id_updated',
  })
  userIdUpdated: number;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_deleted',
  })
  isDeleted: boolean;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'created_time',
  })
  createdTime: Date;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'updated_time',
  })
  updatedTime: Date;

  @OneToMany(() => DoMutationDetail, detail => detail.doMutationId)
  doMutationDetails: DoMutationDetail[];

  @OneToOne(() => Branch)
  @JoinColumn({ name: 'branch_id_from' })
  branchFrom: Branch;

  @OneToOne(() => Branch)
  @JoinColumn({ name: 'branch_id_to' })
  branchTo: Branch;
}
