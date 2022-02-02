import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { BagItem } from './bag-item';
import { BaseActionEntity } from './base-action';
import { DoMutation } from './do-mutation';

@Entity('do_mutation_detail', { schema: 'public' })
@Index('do_mutation_detail_id', ['doMutationDetailId'])
export class DoMutationDetail extends BaseActionEntity {
  @PrimaryColumn({
    type: 'uuid',
    name: 'do_mutation_detail_id',
  })
  doMutationDetailId: string;

  @Column({
    nullable: false,
    type: 'uuid',
    name: 'do_mutation_id',
  })
  doMutationId: string;

  @Column('bigint', {
    name: 'bag_item_id',
  })
  bagItemId: string;

  @Column('numeric', {
    precision: 10,
    scale: 5,
    name: 'weight',
  })
  weight: number;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_deleted',
  })
  isDeleted: boolean;

  @Column('bigint', {
    name: 'user_id_created',
  })
  userIdCreated: number;

  @Column('bigint', {
    name: 'user_id_updated',
  })
  userIdUpdated: number;

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

  @ManyToOne(() => DoMutation, mutation => mutation.doMutationDetails)
  @JoinColumn({ name: 'do_mutation_id' })
  doMutation: DoMutation;

  @OneToOne(() => BagItem)
  @JoinColumn({ name: 'bag_item_id' })
  bagItem: BagItem;
}
